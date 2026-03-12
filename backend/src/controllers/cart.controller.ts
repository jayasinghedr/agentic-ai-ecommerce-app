import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prismaClient';
import { Offer } from '@prisma/client';

// ── Helpers ────────────────────────────────────────────────────────────────

async function getActiveOffer(productId: number): Promise<Offer | null> {
  const now = new Date();
  return prisma.offer.findFirst({
    where: {
      productId,
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });
}

export function applyDiscount(
  price: number,
  offer: Offer | null,
): { finalPrice: number; discountAmount: number } {
  if (!offer) return { finalPrice: price, discountAmount: 0 };
  if (offer.discountType === 'percentage') {
    const discountAmount = price * (offer.discountValue / 100);
    return { finalPrice: Math.max(0, price - discountAmount), discountAmount };
  }
  const discountAmount = Math.min(offer.discountValue, price);
  return { finalPrice: price - discountAmount, discountAmount };
}

async function getOrCreateCart(userId: number) {
  let cart = await prisma.cart.findFirst({
    where: { userId, status: 'active' },
    include: {
      cartItems: {
        include: { product: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId, status: 'active' },
      include: {
        cartItems: { include: { product: true }, orderBy: { createdAt: 'asc' } },
      },
    });
  }
  return cart;
}

async function buildCartResponse(userId: number) {
  const cart = await getOrCreateCart(userId);
  const now = new Date();

  const itemsWithDiscounts = await Promise.all(
    cart.cartItems.map(async (item) => {
      const offer = await prisma.offer.findFirst({
        where: {
          productId: item.productId,
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      });
      const { finalPrice, discountAmount } = applyDiscount(
        item.unitPriceSnapshot,
        offer,
      );
      return {
        ...item,
        offer: offer ?? null,
        finalUnitPrice: finalPrice,
        discountAmount,
        lineTotal: finalPrice * item.quantity,
      };
    }),
  );

  const subtotal = itemsWithDiscounts.reduce((s, i) => s + i.lineTotal, 0);
  const totalDiscount = itemsWithDiscounts.reduce(
    (s, i) => s + i.discountAmount * i.quantity,
    0,
  );

  return {
    id: cart.id,
    status: cart.status,
    items: itemsWithDiscounts,
    subtotal: parseFloat(subtotal.toFixed(2)),
    totalDiscount: parseFloat(totalDiscount.toFixed(2)),
    total: parseFloat(subtotal.toFixed(2)),
  };
}

// ── Controllers ────────────────────────────────────────────────────────────

// GET /api/cart
export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const cartResponse = await buildCartResponse(req.user!.userId);
    res.json(cartResponse);
  } catch (err) {
    next(err);
  }
};

const addItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1),
});

// POST /api/cart/items
export const addItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = addItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
      return;
    }
    const { productId, quantity } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    if (product.stock < quantity) {
      res.status(400).json({ error: `Only ${product.stock} units in stock` });
      return;
    }

    const cart = await getOrCreateCart(req.user!.userId);

    // If item already in cart, increase quantity
    const existing = cart.cartItems.find((i) => i.productId === productId);
    if (existing) {
      const newQty = existing.quantity + quantity;
      if (product.stock < newQty) {
        res.status(400).json({ error: `Only ${product.stock} units in stock` });
        return;
      }
      const offer = await getActiveOffer(productId);
      const { discountAmount } = applyDiscount(product.price, offer);
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: newQty,
          offerApplied: offer !== null,
          discountSnapshot: discountAmount,
        },
      });
    } else {
      const offer = await getActiveOffer(productId);
      const { discountAmount } = applyDiscount(product.price, offer);
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          unitPriceSnapshot: product.price,
          offerApplied: offer !== null,
          discountSnapshot: discountAmount,
        },
      });
    }

    const cartResponse = await buildCartResponse(req.user!.userId);
    res.status(201).json(cartResponse);
  } catch (err) {
    next(err);
  }
};

const updateItemSchema = z.object({ quantity: z.number().int().min(1) });

// PATCH /api/cart/items/:id
export const updateItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const itemId = parseInt(req.params.id);
    const parsed = updateItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
      return;
    }
    const { quantity } = parsed.data;

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
    if (!item || item.cart.userId !== req.user!.userId) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product || product.stock < quantity) {
      res.status(400).json({ error: `Only ${product?.stock ?? 0} units in stock` });
      return;
    }

    const offer = await getActiveOffer(item.productId);
    const { discountAmount } = applyDiscount(item.unitPriceSnapshot, offer);

    await prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity,
        offerApplied: offer !== null,
        discountSnapshot: discountAmount,
      },
    });

    const cartResponse = await buildCartResponse(req.user!.userId);
    res.json(cartResponse);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart/items/:id
export const removeItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const itemId = parseInt(req.params.id);
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
    if (!item || item.cart.userId !== req.user!.userId) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }
    await prisma.cartItem.delete({ where: { id: itemId } });
    const cartResponse = await buildCartResponse(req.user!.userId);
    res.json(cartResponse);
  } catch (err) {
    next(err);
  }
};
