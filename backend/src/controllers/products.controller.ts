import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prismaClient';
import { createAuditLog } from '../utils/auditLog';

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  imageUrl: z.string().url(),
  isActive: z.boolean().optional(),
});

const updateProductSchema = productSchema.partial();

// GET /api/products
export const listProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { search, minPrice, maxPrice, inStock } = req.query;

    const where: Record<string, unknown> = { isActive: true };

    if (search && typeof search === 'string') {
      where.name = { contains: search };
    }
    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: parseFloat(minPrice as string) } : {}),
        ...(maxPrice ? { lte: parseFloat(maxPrice as string) } : {}),
      };
    }
    if (inStock === 'true') {
      where.stock = { gt: 0 };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        offers: {
          where: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(products);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        offers: {
          where: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        },
      },
    });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// POST /api/products (admin)
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
      return;
    }
    const product = await prisma.product.create({ data: parsed.data });
    await createAuditLog(req.user!.userId, 'CREATE_PRODUCT', 'product', product.id, {
      name: product.name,
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/products/:id (admin)
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
      return;
    }
    const product = await prisma.product.update({ where: { id }, data: parsed.data });
    await createAuditLog(req.user!.userId, 'UPDATE_PRODUCT', 'product', product.id, {
      changes: parsed.data,
    });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id (admin — soft delete)
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    await createAuditLog(req.user!.userId, 'DELETE_PRODUCT', 'product', id);
    res.json({ message: 'Product deactivated' });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/products — includes inactive products for admin view
export const adminListProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      include: { offers: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
};
