/**
 * Integration tests for /api/auth routes.
 * Prisma and bcrypt helpers are mocked — no real DB required.
 */

jest.mock('../../utils/prismaClient', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Bypass rate limiter in tests
jest.mock('../../middleware/rateLimiter', () => ({
  authRateLimiter: (_req: any, _res: any, next: any) => next(),
}));

import request from 'supertest';
import app from '../../app';
import prisma from '../../utils/prismaClient';
import * as passwordUtils from '../../utils/password';
import { generateRefreshToken } from '../../utils/jwt';

const mockPrisma = prisma as any;

beforeEach(() => {
  jest.resetAllMocks();
});

// ── POST /api/auth/register ───────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  test('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: 'pass123' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
  });

  test('returns 400 for an invalid email address', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'John', email: 'not-an-email', password: 'pass123' });
    expect(res.status).toBe(400);
  });

  test('returns 400 when password is shorter than 6 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'John', email: 'a@b.com', password: '123' });
    expect(res.status).toBe(400);
  });

  test('returns 409 when email is already registered', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 1, email: 'a@b.com' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'John', email: 'a@b.com', password: 'pass123' });
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error', 'Email already registered');
  });

  test('returns 201 with accessToken and user on successful registration', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    jest.spyOn(passwordUtils, 'hashPassword').mockResolvedValueOnce('hashed_pw');
    mockPrisma.user.create.mockResolvedValueOnce({
      id: 1,
      name: 'John',
      email: 'john@test.com',
      role: 'customer',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'John', email: 'john@test.com', password: 'pass123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user).toMatchObject({ email: 'john@test.com', role: 'customer' });
  });
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  test('returns 400 when password is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
  });

  test('returns 401 when the user does not exist', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@test.com', password: 'pass' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid credentials');
  });

  test('returns 401 when the password is wrong', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 1,
      email: 'a@b.com',
      passwordHash: 'hash',
      status: 'active',
      role: 'customer',
    });
    jest.spyOn(passwordUtils, 'comparePassword').mockResolvedValueOnce(false);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });

  test('returns 200 with accessToken and user on successful login', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 1,
      name: 'John',
      email: 'a@b.com',
      passwordHash: 'hash',
      status: 'active',
      role: 'customer',
    });
    jest.spyOn(passwordUtils, 'comparePassword').mockResolvedValueOnce(true);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'correct' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user).toMatchObject({ email: 'a@b.com' });
  });
});

// ── POST /api/auth/guest ──────────────────────────────────────────────────────

describe('POST /api/auth/guest', () => {
  test('returns 201 with a guest user and accessToken', async () => {
    jest.spyOn(passwordUtils, 'hashPassword').mockResolvedValueOnce('dummy_hash');
    mockPrisma.user.create.mockResolvedValueOnce({
      id: 99,
      name: 'Guest',
      email: 'guest_123@guest.local',
      role: 'guest',
    });

    const res = await request(app).post('/api/auth/guest');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user.role).toBe('guest');
  });
});

// ── POST /api/auth/refresh ────────────────────────────────────────────────────

describe('POST /api/auth/refresh', () => {
  test('returns 401 when no refresh cookie is present', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Refresh token not found');
  });

  test('returns 200 with a new accessToken when a valid refresh cookie is sent', async () => {
    const refreshToken = generateRefreshToken({
      userId: 1,
      role: 'customer',
      email: 'a@b.com',
    });
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: 1,
      name: 'John',
      email: 'a@b.com',
      role: 'customer',
      status: 'active',
    });

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', `refreshToken=${refreshToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────

describe('POST /api/auth/logout', () => {
  test('returns 200 with a success message and clears the cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Logged out successfully');
  });
});
