import { describe, expect, it } from 'vitest';
import { detectCycle } from './cycle-detector.util';
import { generateSecureToken, hashToken } from './token.util';
import { LexoRank } from './lexorank.util';

describe('domain utilities', () => {
  it('detects direct and indirect parent cycles', () => {
    const parents = new Map([['a', null], ['b', 'a'], ['c', 'b']]);
    expect(detectCycle('a', 'c', (id) => parents.get(id) ?? null)).toBe(true);
    expect(detectCycle('c', 'a', (id) => parents.get(id) ?? null)).toBe(false);
    expect(detectCycle('a', 'a', (id) => parents.get(id) ?? null)).toBe(true);
  });

  it('creates hash-only lookup tokens', () => {
    const token = generateSecureToken();
    expect(token.raw).not.toBe(token.hash);
    expect(token.hash).toBe(hashToken(token.raw));
    expect(token.raw).toHaveLength(64);
  });

  it('keeps generated board ranks ordered', () => {
    const rank = LexoRank.between('A', 'C');
    expect('A' < rank && rank < 'C').toBe(true);
    expect(LexoRank.between(null, null)).toBe('U');
  });
});
