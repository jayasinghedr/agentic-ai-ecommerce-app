/**
 * Integration tests for /api/orders routes.
 * Prisma is fully mocked — no real DB required.
 */

jest.mock('../../utils/prismaClient', () => ({
  __esModule: true,
  default: {
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

import request from 'supertest';
import app from '../../app';
import prisma from '../../utils/prismaClient';
import { generateAccessToken } from '../../utils/jwt';

const mockPrisma = prisma as any;

const customerToken = generateAccessToken({ userId: 2, role: 'customer', email: 'user@test.com' });
const otherToken = generateAccessToken({ userId: 99, role: 'customer', email: 'other@test.com' });

const sampleOrder = {
  id: 1,
  userId: 2,
  guestEmail: null,
  totalAmount: 149.99,
  status: 'Processing',
  shippingAddressJson: JSON.stringify({ city: 'Colombo', country: 'LK' }),
  paymentReference: 'PAY-ABC123',
  notes: null,
  placedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  orderItems: [],
};

beforeEach(() => {
  jest.resetAllMocks();
});

// ── GET /api/orders ───────────────────────────────────────────────────────────

describe('GET /api/orders', () => {
  test('returns 401 when no auth token is provided', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });

  test('returns 200 with the user\'s orders', async () => {
    mockPrisma.order.findMany.mockResolvedValueOnce([sampleOrder]);

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].id).toBe(1);
  });
});

// ── GET /api/orders/:id ───────────────────────────────────────────────────────

describe('GET /api/orders/:id', () => {
  test('returns 404 when the order does not exist', async () => {
    mockPrisma.order.findUnique.mockResolvedValueOnce(null);

    const res = await request(app)
      .get('/api/orders/9999')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Order not found');
  });

  test('returns 403 when the order belongs to a different user', async () => {
    // The order belongs to userId=2, but otherToken is userId=99
    mockPrisma.order.findUnique.mockResolvedValueOnce(sampleOrder);

    const res = await request(app)
      .get('/api/orders/1')
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error', 'Forbidden');
  });
});
