import { Router } from 'express';
import {
  listOffers,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer,
} from '../controllers/offers.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Offers
 *   description: Product offers & discounts
 */

/**
 * @swagger
 * /api/offers:
 *   get:
 *     summary: List currently active offers
 *     tags: [Offers]
 *     responses:
 *       200:
 *         description: Array of active offers with product info
 */
router.get('/', listOffers);

/**
 * @swagger
 * /api/offers/{id}:
 *   get:
 *     summary: Get a single offer by ID
 *     tags: [Offers]
 */
router.get('/:id', getOffer);

/**
 * @swagger
 * /api/offers:
 *   post:
 *     summary: Create an item-wise offer (admin only)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, discountType, discountValue, startDate, endDate, productId]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               discountType: { type: string, enum: [percentage, fixed_amount] }
 *               discountValue: { type: number }
 *               startDate: { type: string, format: date-time }
 *               endDate: { type: string, format: date-time }
 *               productId: { type: integer }
 *     responses:
 *       201:
 *         description: Offer created
 */
router.post('/', authenticate, requireRole('admin'), createOffer);

/**
 * @swagger
 * /api/offers/{id}:
 *   patch:
 *     summary: Update an offer (admin only)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id', authenticate, requireRole('admin'), updateOffer);

/**
 * @swagger
 * /api/offers/{id}:
 *   delete:
 *     summary: Delete an offer (admin only)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, requireRole('admin'), deleteOffer);

export default router;
