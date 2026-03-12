import { Router } from 'express';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/products.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product catalog endpoints
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: List active products with optional search and filters
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: inStock
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Array of products (includes active offers)
 */
router.get('/', listProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Product object
 *       404:
 *         description: Product not found
 */
router.get('/:id', getProduct);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Product created
 */
router.post('/', authenticate, requireRole('admin'), createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Update a product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id', authenticate, requireRole('admin'), updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Soft-delete a product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, requireRole('admin'), deleteProduct);

export default router;
