import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prismaClient';

// GET /api/orders — customer's own orders
export const listOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.userId },
      include: {
        orderItems: { include: { product: { select: { id: true, name: true, imageUrl: true } } } },
      },
      orderBy: { placedAt: 'desc' },
    });
    res.json(orders.map(formatOrder));
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id — customer's single order
export const getOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: { include: { product: { select: { id: true, name: true, imageUrl: true } } } },
      },
    });
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    if (order.userId !== req.user!.userId && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    res.json(formatOrder(order));
  } catch (err) {
    next(err);
  }
};

function formatOrder(order: {
  id: number;
  userId: number | null;
  guestEmail: string | null;
  totalAmount: number;
  status: string;
  shippingAddressJson: string;
  paymentReference: string;
  notes: string | null;
  placedAt: Date;
  updatedAt: Date;
  orderItems: {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    unitPriceSnapshot: number;
    offerSnapshotJson: string | null;
    product: { id: number; name: string; imageUrl: string };
  }[];
}) {
  return {
    ...order,
    shippingAddress: JSON.parse(order.shippingAddressJson),
    orderItems: order.orderItems.map((oi) => ({
      ...oi,
      offerSnapshot: oi.offerSnapshotJson ? JSON.parse(oi.offerSnapshotJson) : null,
    })),
  };
}
