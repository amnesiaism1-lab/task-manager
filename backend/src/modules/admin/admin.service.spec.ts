import { describe, expect, it, vi } from 'vitest';
import { AdminService } from './admin.service';
import { ConflictException } from '@nestjs/common';

function createMockRepo() {
  return {
    find: vi.fn(),
    findOne: vi.fn(),
    findAndCount: vi.fn(),
    count: vi.fn(),
    save: vi.fn(async (entity) => entity),
    create: vi.fn((entity) => entity),
    update: vi.fn(),
  } as any;
}

function createMockDataSource() {
  return {
    transaction: vi.fn(async (cb) => {
      const manager = {
        update: vi.fn().mockResolvedValue({ affected: 1 }),
      };
      return cb(manager);
    }),
  } as any;
}

describe('AdminService', () => {
  it('prevents self-lockout when updating status', async () => {
    const userRepo = createMockRepo();
    const sessionRepo = createMockRepo();
    const orgRepo = createMockRepo();
    const dataSource = createMockDataSource();
    const service = new AdminService(userRepo, sessionRepo, orgRepo, dataSource);

    await expect(
      service.updateUserStatus('admin-1', 'admin-1', 'suspended')
    ).rejects.toThrow(ConflictException);
  });

  it('updates target user status when valid', async () => {
    const userRepo = createMockRepo();
    const sessionRepo = createMockRepo();
    const orgRepo = createMockRepo();
    const dataSource = createMockDataSource();
    const service = new AdminService(userRepo, sessionRepo, orgRepo, dataSource);

    userRepo.findOne.mockResolvedValue({ id: 'user-2', status: 'active', email: 'user@test.com' });

    const result = await service.updateUserStatus('admin-1', 'user-2', 'suspended');
    expect(result.status).toBe('suspended');
    expect(dataSource.transaction).toHaveBeenCalled();
  });

  it('prevents self-revocation of all sessions', async () => {
    const userRepo = createMockRepo();
    const sessionRepo = createMockRepo();
    const orgRepo = createMockRepo();
    const dataSource = createMockDataSource();
    const service = new AdminService(userRepo, sessionRepo, orgRepo, dataSource);

    await expect(
      service.forceRevokeAllSessions('admin-1', 'admin-1')
    ).rejects.toThrow(ConflictException);
  });

  it('revokes all sessions for target user', async () => {
    const userRepo = createMockRepo();
    const sessionRepo = createMockRepo();
    const orgRepo = createMockRepo();
    const dataSource = createMockDataSource();
    const service = new AdminService(userRepo, sessionRepo, orgRepo, dataSource);

    userRepo.findOne.mockResolvedValue({ id: 'user-2' });
    sessionRepo.update.mockResolvedValue({ affected: 3 });

    const result = await service.forceRevokeAllSessions('admin-1', 'user-2');
    expect(result.success).toBe(true);
    expect(result.revokedCount).toBe(3);
  });

  it('updates organization status and plan', async () => {
    const userRepo = createMockRepo();
    const sessionRepo = createMockRepo();
    const orgRepo = createMockRepo();
    const dataSource = createMockDataSource();
    const service = new AdminService(userRepo, sessionRepo, orgRepo, dataSource);

    orgRepo.findOne.mockResolvedValue({ id: 'org-1', name: 'Org A', status: 'active', plan: 'free' });

    const result = await service.updateOrganization('org-1', { status: 'suspended', plan: 'enterprise' });
    expect(result.status).toBe('suspended');
    expect(result.plan).toBe('enterprise');
    expect(orgRepo.save).toHaveBeenCalled();
  });
});
