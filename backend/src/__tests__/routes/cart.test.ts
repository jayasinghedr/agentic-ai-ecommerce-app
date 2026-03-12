/**
 * Integration tests for /api/cart routes.
 * Prisma is fully mocked — no real DB required.
 */

jest.mock('../../utils/prismaClient', () => ({
  __esModule: true,
  default: {
    cart: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    cartItem: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
    offer: {
      findFirst: jest.fn(),
    },
  },
}));

import request from 'supertest';
import app from '../../app';
import prisma from '../../utils/prismaClient';
import { generateAccessToken } from '../../utils/jwt';

const mockPrisma = prisma as any;

const customerToken = generateAccessToken({ userId: 2, role: 'customer', email: 'user@test.com' });

const emptyCart = {
  id: 1,
  userId: 2,
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  cartItems: [],
};

const sampleProduct = {
  id: 10,
  name: 'Widget',
  description: 'A fine widget',
  price: 49.99,
  stock: 5,
  imageUrl: 'https://example.com/widget.jpg',
  isActive: true,
};

beforeEach(() => {
  jest.resetAllMocks();
});

// ── GET /api/cart ─────────────────────────────────────────────────────────────

describe('GET /api/cart', () => {
  test('returns 401 when no auth token is provided', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });

  test('returns 200 with an empty cart for an authenticated user', async () => {
    // getOrCreateCart → findFirst returns the empty cart
    mockPrisma.cart.findFirst.mockResolvedValueOnce(emptyCart);

    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body.items).toHaveLength(0);
    expect(res.body.subtotal).toBe(0);
  });
});

// ── POST /api/cart/items ──────────────────────────────────────────────────────

describe('POST /api/cart/items', () => {
  test('returns 401 when no auth token is provided', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .send({ productId: 1, quantity: 1 });
    expect(res.status).toBe(401);
  });

  test('returns 400 for an invalid request body (missing productId)', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ quantity: 1 }); // productId missing
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
  });

  test('returns 404 when the product does not exist', async () => {
    mockPrisma.product.findUnique.mockResolvedValueOnce(null);

    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: 9999, quantity: 1 });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Product not found');
  });

  test('returns 400 when requested quantity exceeds available stock', async () => {
    mockPrisma.product.findUnique.mockResolvedValueOnce({
      ...sampleProduct,
      stock: 2, // only 2 in stock
    });

    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: 10, quantity: 5 }); // requesting 5

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Only 2 units in stock/);
  });
});

// ── DELETE /api/cart/items/:id ────────────────────────────────────────────────

describe('DELETE /api/cart/items/:id', () => {
  test('returns 401 when no auth token is provided', async () => {
    const res = await request(app).delete('/api/cart/items/1');
    expect(res.status).toBe(401);
  });

  test('returns 404 when the cart item does not belong to the user', async () => {
    // cartItem belongs to a different user's cart
    mockPrisma.cartItem.findUnique.mockResolvedValueOnce({
      id: 1,
      cartId: 99,
      cart: { id: 99, userId: 999 }, // different user
    });

    const res = await request(app)
      .delete('/api/cart/items/1')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Cart item not found');
  });
});
