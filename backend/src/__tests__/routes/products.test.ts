/**
 * Integration tests for /api/products routes.
 * Prisma is fully mocked — no real DB required.
 */

jest.mock('../../utils/prismaClient', () => ({
  __esModule: true,
  default: {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}));

import request from 'supertest';
import app from '../../app';
import prisma from '../../utils/prismaClient';
import { generateAccessToken } from '../../utils/jwt';

const mockPrisma = prisma as any;

// Pre-generate tokens for repeated use
const adminToken = generateAccessToken({ userId: 1, role: 'admin', email: 'admin@test.com' });
const customerToken = generateAccessToken({ userId: 2, role: 'customer', email: 'user@test.com' });

const sampleProduct = {
  id: 1,
  name: 'Test Product',
  description: 'A great product',
  price: 99.99,
  stock: 10,
  imageUrl: 'https://example.com/img.jpg',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  offers: [],
};

beforeEach(() => {
  jest.resetAllMocks();
});

// ── GET /api/products ─────────────────────────────────────────────────────────

describe('GET /api/products', () => {
  test('returns 200 with an array of active products', async () => {
    mockPrisma.product.findMany.mockResolvedValueOnce([sampleProduct]);

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(1);
  });

  test('returns 200 with an empty array when no products exist', async () => {
    mockPrisma.product.findMany.mockResolvedValueOnce([]);

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });
});

// ── GET /api/products/:id ─────────────────────────────────────────────────────

describe('GET /api/products/:id', () => {
  test('returns 200 with the product when it exists', async () => {
    mockPrisma.product.findUnique.mockResolvedValueOnce(sampleProduct);

    const res = await request(app).get('/api/products/1');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.name).toBe('Test Product');
  });

  test('returns 404 when the product does not exist', async () => {
    mockPrisma.product.findUnique.mockResolvedValueOnce(null);

    const res = await request(app).get('/api/products/9999');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Product not found');
  });
});

// ── POST /api/products ────────────────────────────────────────────────────────

describe('POST /api/products', () => {
  test('returns 401 when no auth token is provided', async () => {
    const res = await request(app).post('/api/products').send({});
    expect(res.status).toBe(401);
  });

  test('returns 403 when authenticated as a customer (not admin)', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({});
    expect(res.status).toBe(403);
  });

  test('returns 400 for an invalid product body (missing required fields)', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'X' }); // name too short, missing other required fields
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
  });

  test('returns 201 with the created product for a valid admin request', async () => {
    mockPrisma.product.create.mockResolvedValueOnce(sampleProduct);
    mockPrisma.auditLog.create.mockResolvedValueOnce({});

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Product',
        description: 'A great product description',
        price: 99.99,
        stock: 10,
        imageUrl: 'https://example.com/img.jpg',
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(1);
  });
});

// ── PATCH /api/products/:id ───────────────────────────────────────────────────

describe('PATCH /api/products/:id', () => {
  test('returns 401 when not authenticated', async () => {
    const res = await request(app).patch('/api/products/1').send({ price: 50 });
    expect(res.status).toBe(401);
  });

  test('returns 200 with the updated product for a valid admin request', async () => {
    mockPrisma.product.update.mockResolvedValueOnce({ ...sampleProduct, price: 50 });
    mockPrisma.auditLog.create.mockResolvedValueOnce({});

    const res = await request(app)
      .patch('/api/products/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 50 });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(50);
  });
});

// ── DELETE /api/products/:id ──────────────────────────────────────────────────

describe('DELETE /api/products/:id', () => {
  test('returns 403 when authenticated as a customer', async () => {
    const res = await request(app)
      .delete('/api/products/1')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
  });

  test('returns 200 with a success message for a valid admin soft-delete', async () => {
    mockPrisma.product.update.mockResolvedValueOnce({ ...sampleProduct, isActive: false });
    mockPrisma.auditLog.create.mockResolvedValueOnce({});

    const res = await request(app)
      .delete('/api/products/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Product deactivated');
  });
});
