import { describe, expect, it, vi } from 'vitest';
import { ApiTokenService } from './api-token.service';

function repository() {
  return { find: vi.fn(), findOne: vi.fn(), save: vi.fn(async (value) => value), create: vi.fn((value) => value) } as any;
}

describe('ApiTokenService', () => {
  it('returns a raw token once and persists only its hash', async () => {
    const repo = repository();
    const service = new ApiTokenService(repo, repository());
    const created = await service.create('org-a', 'member-a', { name: 'CI', scopes: ['read'] });
    expect(created.token).toMatch(/^[a-f0-9]{64}$/);
    expect(repo.save).toHaveBeenCalled();
    expect(repo.save.mock.calls[0][0].tokenHash).not.toBe(created.token);
    expect(repo.save.mock.calls[0][0].tokenHash).toHaveLength(64);
  });

  it('rejects invalid scopes and rejects insufficient scope during authentication', async () => {
    const tokenRepo = repository();
    const memberRepo = repository();
    const service = new ApiTokenService(tokenRepo, memberRepo);
    await expect(service.create('org-a', 'member-a', { name: 'bad', scopes: ['root'] })).rejects.toThrow('Token scope is invalid');
    tokenRepo.findOne.mockResolvedValue({ scopes: ['read'], revokedAt: null, expiresAt: null, memberId: 'm-1' });
    expect(await service.authenticate('token', 'write')).toBeNull();
  });

  it('rejects PAT if the member is suspended or inactive', async () => {
    const tokenRepo = repository();
    const memberRepo = repository();
    const service = new ApiTokenService(tokenRepo, memberRepo);
    tokenRepo.findOne.mockResolvedValue({ scopes: ['read'], revokedAt: null, expiresAt: null, memberId: 'm-1' });
    memberRepo.findOne.mockResolvedValue({ id: 'm-1', status: 'suspended' });
    expect(await service.authenticate('token', 'read')).toBeNull();

    memberRepo.findOne.mockResolvedValue({ id: 'm-1', status: 'active' });
    tokenRepo.save.mockImplementation(async (t: any) => t);
    const result = await service.authenticate('token', 'read');
    expect(result).not.toBeNull();
  });
});