import { describe, expect, it } from 'vitest';

/**
 * ISTQB Automated Test Suite: Concurrency, Optimistic Locking & Idempotency
 * Mapped to Test Cases: TC-CONC-001, TC-ISS-003 in TEST_CASE_SPECIFICATION.md
 * Standards: ISTQB CTAL-TTA & ISO/IEC/IEEE 29119-3
 */

interface VersionedEntity {
  id: string;
  summary: string;
  version: number;
}

class OptimisticLockStore {
  private entity: VersionedEntity;
  private idempotencyLog = new Map<string, any>();

  constructor(initialEntity: VersionedEntity) {
    this.entity = { ...initialEntity };
  }

  getEntity(): VersionedEntity {
    return { ...this.entity };
  }

  update(
    expectedVersion: number,
    newSummary: string,
    idempotencyKey?: string
  ): { success: boolean; data?: VersionedEntity; error?: string } {
    if (idempotencyKey && this.idempotencyLog.has(idempotencyKey)) {
      return { success: true, data: this.idempotencyLog.get(idempotencyKey) };
    }

    // Check version
    if (expectedVersion !== this.entity.version) {
      return {
        success: false,
        error: 'VERSION_MISMATCH_CONFLICT',
      };
    }

    // Atomic increment
    this.entity.summary = newSummary;
    this.entity.version += 1;

    const result = { ...this.entity };
    if (idempotencyKey) {
      this.idempotencyLog.set(idempotencyKey, result);
    }

    return { success: true, data: result };
  }
}

describe('ISTQB Concurrency & Optimistic Locking Test Suite (TC-CONC-001)', () => {
  it('TC-ISS-003: updates successfully when expectedVersion matches current version and increments version', () => {
    const store = new OptimisticLockStore({ id: 'ALPHA-1', summary: 'Original Summary', version: 1 });

    const result = store.update(1, 'Updated Summary');
    expect(result.success).toBe(true);
    expect(result.data?.version).toBe(2);
    expect(result.data?.summary).toBe('Updated Summary');
  });

  it('TC-CONC-001: rejects update with VERSION_MISMATCH_CONFLICT when expectedVersion is stale', () => {
    const store = new OptimisticLockStore({ id: 'ALPHA-1', summary: 'Original Summary', version: 2 });

    // Client A sends update based on stale version 1
    const result = store.update(1, 'Stale Update by Client A');
    expect(result.success).toBe(false);
    expect(result.error).toBe('VERSION_MISMATCH_CONFLICT');

    // Store state remains unchanged
    expect(store.getEntity().version).toBe(2);
    expect(store.getEntity().summary).toBe('Original Summary');
  });

  it('TC-CONC-001 (Simulated Concurrency): simulates 2 concurrent clients updating same entity', () => {
    const store = new OptimisticLockStore({ id: 'ALPHA-1', summary: 'Initial', version: 10 });

    // Client 1 and Client 2 both read version 10
    const client1ExpectedVersion = 10;
    const client2ExpectedVersion = 10;

    // Client 1 commits first
    const client1Result = store.update(client1ExpectedVersion, 'Client 1 Update');
    expect(client1Result.success).toBe(true);
    expect(client1Result.data?.version).toBe(11);

    // Client 2 attempts to commit with stale version 10
    const client2Result = store.update(client2ExpectedVersion, 'Client 2 Update');
    expect(client2Result.success).toBe(false);
    expect(client2Result.error).toBe('VERSION_MISMATCH_CONFLICT');

    // Final entity summary belongs strictly to Client 1 (No Lost Update)
    expect(store.getEntity().summary).toBe('Client 1 Update');
    expect(store.getEntity().version).toBe(11);
  });

  it('handles idempotency keys to prevent duplicate execution', () => {
    const store = new OptimisticLockStore({ id: 'ALPHA-1', summary: 'Initial', version: 1 });
    const idempotencyKey = 'idemp-req-12345';

    // First request
    const res1 = store.update(1, 'First Attempt', idempotencyKey);
    expect(res1.success).toBe(true);
    expect(res1.data?.version).toBe(2);

    // Repeated request with same idempotency key
    const res2 = store.update(1, 'Repeated Attempt', idempotencyKey);
    expect(res2.success).toBe(true);
    // Returns cached result without re-incrementing version
    expect(res2.data?.version).toBe(2);
    expect(store.getEntity().version).toBe(2);
  });
});
