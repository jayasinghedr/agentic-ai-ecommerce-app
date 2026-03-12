/**
 * Integration tests for /api/admin routes.
 * Prisma is fully mocked — no real DB required.
 */

jest.mock('../../utils/prismaClient', () => ({
  __esModule: true,
  default: {
    order: {
      count: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    product: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    offer: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
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

const adminToken = generateAccessToken({ userId: 1, role: 'admin', email: 'admin@test.com' });
const customerToken = generateAccessToken({ userId: 2, role: 'customer', email: 'user@test.com' });

beforeEach(() => {
  jest.resetAllMocks();
});

// ── GET /api/admin/metrics ────────────────────────────────────────────────────

describe('GET /api/admin/metrics', () => {
  test('returns 401 when no auth token is provided', async () => {
    const res = await request(app).get('/api/admin/metrics');
    expect(res.status).toBe(401);
  });

  test('returns 403 when authenticated as a customer', async () => {
    const res = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
  });

  test('returns 200 with dashboard metrics for an admin user', async () => {
    mockPrisma.order.count.mockResolvedValueOnce(42);
    mockPrisma.product.count.mockResolvedValueOnce(15);
    mockPrisma.offer.count.mockResolvedValueOnce(3);
    mockPrisma.order.aggregate.mockResolvedValueOnce({ _sum: { totalAmount: 9999.99 } });
    mockPrisma.user.count.mockResolvedValueOnce(100);

    const res = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      totalOrders: 42,
      totalProducts: 15,
      activeOffers: 3,
      totalRevenue: 9999.99,
      totalUsers: 100,
    });
  });
});

// ── GET /api/admin/orders ─────────────────────────────────────────────────────

describe('GET /api/admin/orders', () => {
  test('returns 200 with all orders for an admin user', async () => {
    const orderRow = {
      id: 1,
      userId: 2,
      guestEmail: null,
      totalAmount: 99.99,
      status: 'Processing',
      shippingAddressJson: JSON.stringify({ city: 'Colombo' }),
      paymentReference: 'PAY-XYZ',
      notes: null,
      placedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: { id: 2, name: 'John', email: 'john@test.com' },
      orderItems: [],
    };
    mockPrisma.order.findMany.mockResolvedValueOnce([orderRow]);

    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].id).toBe(1);
  });
});

// ── PATCH /api/admin/orders/:id/status ───────────────────────────────────────

describe('PATCH /api/admin/orders/:id/status', () => {
  test('returns 400 for an invalid status value', async () => {
    const res = await request(app)
      .patch('/api/admin/orders/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Cancelled' }); // not in enum

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
  });

  test('returns 200 when the order status is updated successfully', async () => {
    mockPrisma.order.update.mockResolvedValueOnce({
      id: 1,
      status: 'Shipped',
    });
    mockPrisma.auditLog.create.mockResolvedValueOnce({});

    const res = await request(app)
      .patch('/api/admin/orders/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Shipped' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Shipped');
  });
});
