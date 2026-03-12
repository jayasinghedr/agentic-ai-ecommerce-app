import { Router } from 'express';
import { listOrders, getOrder } from '../controllers/orders.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Customer order tracking
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get current customer's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of orders
 */
router.get('/', authenticate, listOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get a single order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order detail
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.get('/:id', authenticate, getOrder);

export default router;
