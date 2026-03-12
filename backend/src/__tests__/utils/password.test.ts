import { hashPassword, comparePassword } from '../../utils/password';

describe('Password Utilities', () => {
  test('hashPassword returns a bcrypt-formatted hash string', async () => {
    const hash = await hashPassword('mypassword');
    expect(typeof hash).toBe('string');
    // bcrypt hashes start with $2a$ or $2b$
    expect(hash).toMatch(/^\$2[ab]\$.+/);
  });

  test('hashPassword produces different hashes for the same input (random salt)', async () => {
    const hash1 = await hashPassword('mypassword');
    const hash2 = await hashPassword('mypassword');
    expect(hash1).not.toBe(hash2);
  });

  test('comparePassword returns true for the correct password', async () => {
    const hash = await hashPassword('secret123');
    const result = await comparePassword('secret123', hash);
    expect(result).toBe(true);
  });

  test('comparePassword returns false for an incorrect password', async () => {
    const hash = await hashPassword('secret123');
    const result = await comparePassword('wrong_password', hash);
    expect(result).toBe(false);
  });
});
