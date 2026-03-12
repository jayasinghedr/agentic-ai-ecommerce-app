import { Request, Response, NextFunction } from 'express';
import { authenticate, optionalAuthenticate, requireRole } from '../../middleware/auth';
import { generateAccessToken } from '../../utils/jwt';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeMockRes() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

function makeMockReq(headers: Record<string, string> = {}): Request {
  return { headers } as unknown as Request;
}

// ── authenticate ─────────────────────────────────────────────────────────────

describe('authenticate middleware', () => {
  test('returns 401 when Authorization header is absent', () => {
    const req = makeMockReq();
    const res = makeMockRes();
    const next = jest.fn() as NextFunction;

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Access token required' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when Authorization header does not start with "Bearer "', () => {
    const req = makeMockReq({ authorization: 'Basic abc123' });
    const res = makeMockRes();
    const next = jest.fn() as NextFunction;

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 for a malformed Bearer token', () => {
    const req = makeMockReq({ authorization: 'Bearer this.is.garbage' });
    const res = makeMockRes();
    const next = jest.fn() as NextFunction;

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Invalid or expired access token' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next() and attaches user for a valid Bearer token', () => {
    const payload = { userId: 1, role: 'customer', email: 'a@b.com' };
    const token = generateAccessToken(payload);
    const req = makeMockReq({ authorization: `Bearer ${token}` }) as any;
    const res = makeMockRes();
    const next = jest.fn() as NextFunction;

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject(payload);
  });
});

// ── optionalAuthenticate ──────────────────────────────────────────────────────

describe('optionalAuthenticate middleware', () => {
  test('calls next() and does not set user when no header is present', () => {
    const req = makeMockReq() as any;
    const res = makeMockRes();
    const next = jest.fn() as NextFunction;

    optionalAuthenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeUndefined();
  });

  test('calls next() and does not set user for an invalid token', () => {
    const req = makeMockReq({ authorization: 'Bearer bad.token.here' }) as any;
    const res = makeMockRes();
    const next = jest.fn() as NextFunction;

    optionalAuthenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeUndefined();
  });

  test('attaches user and calls next() for a valid token', () => {
    const payload = { userId: 2, role: 'admin', email: 'admin@b.com' };
    const token = generateAccessToken(payload);
    const req = makeMockReq({ authorization: `Bearer ${token}` }) as any;
    const res = makeMockRes();
    const next = jest.fn() as NextFunction;

    optionalAuthenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject(payload);
  });
});

// ── requireRole ───────────────────────────────────────────────────────────────

describe('requireRole middleware', () => {
  test('returns 401 when req.user is not set', () => {
    const req = {} as any;
    const res = makeMockRes();
    const next = jest.fn() as NextFunction;

    requireRole('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Authentication required' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 403 when user does not have the required role', () => {
    const req = { user: { userId: 1, role: 'customer', email: 'a@b.com' } } as any;
    const res = makeMockRes();
    const next = jest.fn() as NextFunction;

    requireRole('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Insufficient permissions' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next() when user has the exact required role', () => {
    const req = { user: { userId: 1, role: 'admin', email: 'a@b.com' } } as any;
    const res = makeMockRes();
    const next = jest.fn() as NextFunction;

    requireRole('admin')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  test('calls next() when user matches one of multiple allowed roles', () => {
    const req = { user: { userId: 1, role: 'customer', email: 'a@b.com' } } as any;
    const res = makeMockRes();
    const next = jest.fn() as NextFunction;

    requireRole('admin', 'customer')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
