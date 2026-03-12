import { Router } from 'express';
import { preview, confirm } from '../controllers/checkout.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Checkout
 *   description: Checkout flow
 */

/**
 * @swagger
 * /api/checkout/preview:
 *   post:
 *     summary: Preview order totals before confirming
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Line items with discounts and totals
 *       400:
 *         description: Cart is empty
 */
router.post('/preview', authenticate, preview);

/**
 * @swagger
 * /api/checkout/confirm:
 *   post:
 *     summary: Confirm order — creates order, simulates payment, clears cart
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shipping]
 *             properties:
 *               shipping:
 *                 type: object
 *                 required: [firstName, lastName, email, phone, address, city, postalCode, country]
 *                 properties:
 *                   firstName: { type: string }
 *                   lastName: { type: string }
 *                   email: { type: string }
 *                   phone: { type: string }
 *                   address: { type: string }
 *                   city: { type: string }
 *                   postalCode: { type: string }
 *                   country: { type: string }
 *     responses:
 *       201:
 *         description: Order created successfully
 */
router.post('/confirm', authenticate, confirm);

export default router;
