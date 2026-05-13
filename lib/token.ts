import crypto from 'crypto';

export function generateToken(): { token: string; expiresAt: number } {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return { token, expiresAt };
}

export function generatePasswordResetToken(): { token: string; expiresAt: number } {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours (extended for testing)
  return { token, expiresAt };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}
