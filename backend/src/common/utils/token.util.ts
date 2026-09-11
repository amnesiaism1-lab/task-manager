import { randomBytes, createHash } from 'crypto';

/**
 * Generate a cryptographically secure random token.
 * Returns { raw, hash } — raw is shown once, hash is persisted.
 * Per SRS BR-33/34: tokens are stored hash-only.
 */
export function generateSecureToken(bytes = 32): { raw: string; hash: string } {
  const raw = randomBytes(bytes).toString('hex');
  const hash = createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}

/**
 * Hash a raw token for lookup.
 */
export function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}
