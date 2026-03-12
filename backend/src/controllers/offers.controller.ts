import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prismaClient';
import { createAuditLog } from '../utils/auditLog';

const offerSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  discountType: z.enum(['percentage', 'fixed_amount']),
  discountValue: z.number().positive(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isActive: z.boolean().optional(),
  productId: z.number().int().positive(),
});

const updateOfferSchema = offerSchema.partial();

// GET /api/offers
export const listOffers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const now = new Date();
    const offers = await prisma.offer.findMany({
      where: { isActive: true, startDate: { lte: now }, endDate: { gte: now } },
      include: { product: { select: { id: true, name: true, price: true, imageUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(offers);
  } catch (err) {
    next(err);
  }
};

// GET /api/offers/:id
export const getOffer = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!offer) {
      res.status(404).json({ error: 'Offer not found' });
      return;
    }
    res.json(offer);
  } catch (err) {
    next(err);
  }
};

// POST /api/offers (admin)
export const createOffer = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = offerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
      return;
    }
    const { startDate, endDate, ...rest } = parsed.data;
    const offer = await prisma.offer.create({
      data: { ...rest, startDate: new Date(startDate), endDate: new Date(endDate) },
      include: { product: { select: { id: true, name: true } } },
    });
    await createAuditLog(req.user!.userId, 'CREATE_OFFER', 'offer', offer.id, {
      title: offer.title,
    });
    res.status(201).json(offer);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/offers/:id (admin)
export const updateOffer = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const parsed = updateOfferSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
      return;
    }
    const { startDate, endDate, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };
    if (startDate) data.startDate = new Date(startDate);
    if (endDate) data.endDate = new Date(endDate);

    const offer = await prisma.offer.update({ where: { id }, data });
    await createAuditLog(req.user!.userId, 'UPDATE_OFFER', 'offer', id, {
      changes: parsed.data,
    });
    res.json(offer);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/offers/:id (admin)
export const deleteOffer = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    await prisma.offer.delete({ where: { id } });
    await createAuditLog(req.user!.userId, 'DELETE_OFFER', 'offer', id);
    res.json({ message: 'Offer deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/offers — all offers regardless of active status
export const adminListOffers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const offers = await prisma.offer.findMany({
      include: { product: { select: { id: true, name: true, price: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(offers);
  } catch (err) {
    next(err);
  }
};
