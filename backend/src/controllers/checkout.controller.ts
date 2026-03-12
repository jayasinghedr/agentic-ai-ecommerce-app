import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import prisma from '../utils/prismaClient';
import { applyDiscount } from './cart.controller';

const shippingSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
  address: z.string().min(5),
  city: z.string().min(2),
  postalCode: z.string().min(3),
  country: z.string().min(2),
});

const confirmSchema = z.object({
  shipping: shippingSchema,
});

async function getActiveCartWithOffers(userId: number) {
  const now = new Date();
  const cart = await prisma.cart.findFirst({
    where: { userId, status: 'active' },
    include: {
      cartItems: {
        include: {
          product: {
            include: {
              offers: {
                where: {
                  isActive: true,
                  startDate: { lte: now },
                  endDate: { gte: now },
                },
              },
            },
          },
        },
      },
    },
  });
  return cart;
}

// POST /api/checkout/preview
export const preview = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const cart = await getActiveCartWithOffers(req.user!.userId);
    if (!cart || cart.cartItems.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    const lineItems = cart.cartItems.map((item) => {
      const activeOffer = item.product.offers[0] ?? null;
      const { finalPrice, discountAmount } = applyDiscount(
        item.product.price,
        activeOffer,
      );
      return {
        productId: item.productId,
        productName: item.product.name,
        imageUrl: item.product.imageUrl,
        quantity: item.quantity,
        unitPrice: item.product.price,
        discountAmount,
        finalUnitPrice: finalPrice,
        lineTotal: parseFloat((finalPrice * item.quantity).toFixed(2)),
        offer: activeOffer
          ? {
              id: activeOffer.id,
              title: activeOffer.title,
              discountType: activeOffer.discountType,
              discountValue: activeOffer.discountValue,
            }
          : null,
      };
    });

    const subtotal = lineItems.reduce((s, i) => s + i.lineTotal, 0);
    const totalDiscount = lineItems.reduce(
      (s, i) => s + i.discountAmount * i.quantity,
      0,
    );

    res.json({
      lineItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalDiscount: parseFloat(totalDiscount.toFixed(2)),
      total: parseFloat(subtotal.toFixed(2)),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/checkout/confirm
export const confirm = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = confirmSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
      return;
    }
    const { shipping } = parsed.data;

    const cart = await getActiveCartWithOffers(req.user!.userId);
    if (!cart || cart.cartItems.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    const now = new Date();
    const lineItems = cart.cartItems.map((item) => {
      const activeOffer = item.product.offers[0] ?? null;
      const { finalPrice, discountAmount } = applyDiscount(
        item.product.price,
        activeOffer,
      );
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPriceSnapshot: item.product.price,
        discountAmount,
        finalUnitPrice: finalPrice,
        lineTotal: finalPrice * item.quantity,
        offerSnapshot: activeOffer,
      };
    });

    const total = lineItems.reduce((s, i) => s + i.lineTotal, 0);
    const isGuest = req.user!.role === 'guest';

    const order = await prisma.order.create({
      data: {
        userId: isGuest ? null : req.user!.userId,
        guestEmail: isGuest ? shipping.email : null,
        totalAmount: parseFloat(total.toFixed(2)),
        status: 'Processing',
        shippingAddressJson: JSON.stringify(shipping),
        paymentReference: `PAY-${randomBytes(6).toString('hex').toUpperCase()}`,
        orderItems: {
          create: lineItems.map((li) => ({
            productId: li.productId,
            quantity: li.quantity,
            unitPriceSnapshot: li.unitPriceSnapshot,
            offerSnapshotJson: li.offerSnapshot
              ? JSON.stringify(li.offerSnapshot)
              : null,
          })),
        },
      },
      include: { orderItems: { include: { product: true } } },
    });

    // Reduce stock
    for (const li of lineItems) {
      await prisma.product.update({
        where: { id: li.productId },
        data: { stock: { decrement: li.quantity } },
      });
    }

    // Mark cart as converted
    await prisma.cart.update({ where: { id: cart.id }, data: { status: 'converted' } });

    res.status(201).json({
      order: {
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        paymentReference: order.paymentReference,
        placedAt: order.placedAt,
        shippingAddress: JSON.parse(order.shippingAddressJson),
        items: order.orderItems.map((oi) => ({
          productId: oi.productId,
          productName: oi.product.name,
          quantity: oi.quantity,
          unitPrice: oi.unitPriceSnapshot,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};
