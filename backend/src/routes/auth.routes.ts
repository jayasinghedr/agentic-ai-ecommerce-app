import { Router } from 'express';
import { register, login, guestLogin, refreshToken, logout } from '../controllers/auth.controller';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new customer account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Jane Doe" }
 *               email: { type: string, example: "jane@example.com" }
 *               password: { type: string, example: "secret123" }
 *     responses:
 *       201:
 *         description: Registration successful
 *       409:
 *         description: Email already registered
 */
router.post('/register', authRateLimiter, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "admin@nexagear.com" }
 *               password: { type: string, example: "admin123" }
 *     responses:
 *       200:
 *         description: Login successful, returns accessToken
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authRateLimiter, login);

/**
 * @swagger
 * /api/auth/guest:
 *   post:
 *     summary: Start a guest session
 *     tags: [Auth]
 *     responses:
 *       201:
 *         description: Guest session created
 */
router.post('/guest', authRateLimiter, guestLogin);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token using httpOnly refresh cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: Invalid or missing refresh token
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout and clear refresh cookie
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', logout);

export default router;
