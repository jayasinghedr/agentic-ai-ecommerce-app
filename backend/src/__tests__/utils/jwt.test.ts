import jwt from 'jsonwebtoken';
import {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt';

const payload = { userId: 1, role: 'customer', email: 'test@example.com' };

describe('JWT Utilities — Access Token', () => {
  test('generateAccessToken returns a non-empty string', () => {
    const token = generateAccessToken(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  test('generateAccessToken produces a well-formed JWT (3 parts)', () => {
    const token = generateAccessToken(payload);
    expect(token.split('.')).toHaveLength(3);
  });

  test('verifyAccessToken decodes the correct payload', () => {
    const token = generateAccessToken(payload);
    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.email).toBe(payload.email);
  });

  test('verifyAccessToken throws on a completely invalid token string', () => {
    expect(() => verifyAccessToken('invalid.token.here')).toThrow();
  });

  test('verifyAccessToken throws when token is signed with a different secret', () => {
    const fakeToken = jwt.sign(payload, 'wrong-secret');
    expect(() => verifyAccessToken(fakeToken)).toThrow();
  });
});

describe('JWT Utilities — Refresh Token', () => {
  test('generateRefreshToken returns a non-empty string', () => {
    const token = generateRefreshToken(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  test('verifyRefreshToken decodes the correct payload', () => {
    const token = generateRefreshToken(payload);
    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.email).toBe(payload.email);
  });

  test('verifyRefreshToken throws on an invalid token', () => {
    expect(() => verifyRefreshToken('bad.refresh.token')).toThrow();
  });
});
