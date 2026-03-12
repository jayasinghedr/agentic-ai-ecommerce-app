import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prismaClient';
import { createAuditLog } from '../utils/auditLog';

// GET /api/admin/metrics
export const getMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const now = new Date();
    const [totalOrders, totalProducts, activeOffers, revenue, totalUsers] =
      await Promise.all([
        prisma.order.count(),
        prisma.product.count({ where: { isActive: true } }),
        prisma.offer.count({
          where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
        }),
        prisma.order.aggregate({ _sum: { totalAmount: true } }),
        prisma.user.count({ where: { role: { in: ['admin', 'customer'] } } }),
      ]);

    res.json({
      totalOrders,
      totalProducts,
      activeOffers,
      totalRevenue: parseFloat((revenue._sum.totalAmount ?? 0).toFixed(2)),
      totalUsers,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/orders
export const listAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { status } = req.query;
    const where: Record<string, unknown> = {};
    if (status && typeof status === 'string') where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: {
          include: { product: { select: { id: true, name: true } } },
        },
      },
      orderBy: { placedAt: 'desc' },
    });

    res.json(
      orders.map((o) => ({
        ...o,
        shippingAddress: JSON.parse(o.shippingAddressJson),
        orderItems: o.orderItems.map((oi) => ({
          ...oi,
          offerSnapshot: oi.offerSnapshotJson ? JSON.parse(oi.offerSnapshotJson) : null,
        })),
      })),
    );
  } catch (err) {
    next(err);
  }
};

const updateStatusSchema = z.object({
  status: z.enum(['Processing', 'Shipped', 'Delivered']),
  notes: z.string().optional(),
});

// PATCH /api/admin/orders/:id/status
export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
      return;
    }
    const order = await prisma.order.update({
      where: { id },
      data: parsed.data,
    });
    await createAuditLog(
      req.user!.userId,
      'UPDATE_ORDER_STATUS',
      'order',
      id,
      { newStatus: parsed.data.status },
    );
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
export const listUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: { role: { in: ['admin', 'customer'] } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};
