import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prismaClient';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';

const REFRESH_COOKIE = 'refreshToken';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/register
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
      return;
    }
    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: 'customer' },
    });

    const payload = { userId: user.id, role: user.role, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
    res.status(201).json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
      return;
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.status !== 'active') {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const payload = { userId: user.id, role: user.role, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
    res.json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/guest
export const guestLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ttl = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const guestEmail = `guest_${Date.now()}@guest.local`;
    const dummyHash = await hashPassword(Math.random().toString(36));

    const guest = await prisma.user.create({
      data: {
        name: 'Guest',
        email: guestEmail,
        passwordHash: dummyHash,
        role: 'guest',
        guestTtl: ttl,
      },
    });

    const payload = { userId: guest.id, role: guest.role, email: guest.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
    res.status(201).json({
      accessToken,
      user: { id: guest.id, name: 'Guest', email: guest.email, role: 'guest' },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token: string | undefined = req.cookies[REFRESH_COOKIE];
    if (!token) {
      res.status(401).json({ error: 'Refresh token not found' });
      return;
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.status !== 'active') {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }

    const newPayload = { userId: user.id, role: user.role, email: user.email };
    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    res.cookie(REFRESH_COOKIE, newRefreshToken, COOKIE_OPTS);
    res.json({
      accessToken: newAccessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
export const logout = (_req: Request, res: Response): void => {
  res.clearCookie(REFRESH_COOKIE);
  res.json({ message: 'Logged out successfully' });
};
