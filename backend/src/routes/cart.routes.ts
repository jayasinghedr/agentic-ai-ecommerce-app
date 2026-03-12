import { Router } from 'express';
import { getCart, addItem, updateItem, removeItem } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get current user's cart with discounts applied
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart with items, discounts, and totals
 */
router.get('/', authenticate, getCart);

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     summary: Add an item to the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId: { type: integer }
 *               quantity: { type: integer, minimum: 1 }
 *     responses:
 *       201:
 *         description: Updated cart
 */
router.post('/items', authenticate, addItem);

/**
 * @swagger
 * /api/cart/items/{id}:
 *   patch:
 *     summary: Update quantity of a cart item
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/items/:id', authenticate, updateItem);

/**
 * @swagger
 * /api/cart/items/{id}:
 *   delete:
 *     summary: Remove an item from the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/items/:id', authenticate, removeItem);

export default router;
