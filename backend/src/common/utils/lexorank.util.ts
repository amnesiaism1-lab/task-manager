/**
 * LexoRank implementation for board issue ordering.
 * Per SRS FR-TRANS-02 / BR-10: rank unique per board.
 */
export class LexoRank {
  private static readonly MIN_CHAR = '0';
  private static readonly MAX_CHAR = 'z';
  private static readonly MID_CHAR = 'U';

  /**
   * Generate a rank between two existing ranks.
   * If prev is empty, generate before next.
   * If next is empty, generate after prev.
   */
  static between(prev: string | null, next: string | null): string {
    if (!prev && !next) {
      return this.MID_CHAR;
    }
    if (!prev) {
      return this.decrementRank(next!);
    }
    if (!next) {
      return this.incrementRank(prev);
    }
    return this.midpoint(prev, next);
  }

  static initial(): string {
    return this.MID_CHAR;
  }

  private static midpoint(a: string, b: string): string {
    const maxLen = Math.max(a.length, b.length);
    const padA = a.padEnd(maxLen, this.MIN_CHAR);
    const padB = b.padEnd(maxLen, this.MIN_CHAR);

    let result = '';
    for (let i = 0; i < maxLen; i++) {
      const charA = padA.charCodeAt(i);
      const charB = padB.charCodeAt(i);
      const mid = Math.floor((charA + charB) / 2);
      result += String.fromCharCode(mid);
    }

    if (result === a) {
      result += this.MID_CHAR;
    }

    return result;
  }

  private static incrementRank(rank: string): string {
    const lastChar = rank.charCodeAt(rank.length - 1);
    if (lastChar < this.MAX_CHAR.charCodeAt(0)) {
      return rank.slice(0, -1) + String.fromCharCode(lastChar + 1);
    }
    return rank + this.MID_CHAR;
  }

  private static decrementRank(rank: string): string {
    const lastChar = rank.charCodeAt(rank.length - 1);
    if (lastChar > this.MIN_CHAR.charCodeAt(0) + 1) {
      return rank.slice(0, -1) + String.fromCharCode(lastChar - 1);
    }
    return rank.slice(0, -1) + String.fromCharCode(lastChar - 1) + this.MID_CHAR;
  }
}
