import { Router } from 'express';
import {
  getMetrics,
  listAllOrders,
  updateOrderStatus,
  listUsers,
} from '../controllers/admin.controller';
import {
  adminListProducts,
} from '../controllers/products.controller';
import {
  adminListOffers,
} from '../controllers/offers.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// All admin routes require admin role
router.use(authenticate, requireRole('admin'));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only management endpoints
 */

/**
 * @swagger
 * /api/admin/metrics:
 *   get:
 *     summary: Get dashboard metrics totals
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metrics object
 */
router.get('/metrics', getMetrics);

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: List all products (including inactive)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/products', adminListProducts);

/**
 * @swagger
 * /api/admin/offers:
 *   get:
 *     summary: List all offers (including inactive/expired)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/offers', adminListOffers);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: List all orders with optional status filter
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Processing, Shipped, Delivered]
 */
router.get('/orders', listAllOrders);

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [Processing, Shipped, Delivered] }
 *               notes: { type: string }
 */
router.patch('/orders/:id/status', updateOrderStatus);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List all registered users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/users', listUsers);

export default router;
