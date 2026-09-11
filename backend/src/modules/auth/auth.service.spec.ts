import { describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

function createMockRepo() {
  return {
    find: vi.fn(),
    findOne: vi.fn(),
    save: vi.fn(async (entity) => entity),
    create: vi.fn((entity) => entity),
    update: vi.fn().mockResolvedValue({ affected: 1 }),
  } as any;
}

describe('AuthService - Session Management (UC-AUTH-07)', () => {
  it('prevents revoking the current active session', async () => {
    const users = createMockRepo();
    const sessions = createMockRepo();
    const verificationTokens = createMockRepo();
    const resetTokens = createMockRepo();
    const auditLogs = createMockRepo();
    const mail = { send: vi.fn() } as any;
    const jwt = { signAsync: vi.fn() } as any;
    const config = { get: vi.fn(), getOrThrow: vi.fn() } as any;
    const dataSource = {} as any;

    const auth = new AuthService(users, sessions, verificationTokens, resetTokens, auditLogs, mail, jwt, config, dataSource);

    await expect(
      auth.revokeSession('user-1', 'session-current', 'session-current')
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException if target session does not exist or is inactive', async () => {
    const users = createMockRepo();
    const sessions = createMockRepo();
    const verificationTokens = createMockRepo();
    const resetTokens = createMockRepo();
    const auditLogs = createMockRepo();
    const mail = { send: vi.fn() } as any;
    const jwt = { signAsync: vi.fn() } as any;
    const config = { get: vi.fn(), getOrThrow: vi.fn() } as any;
    const dataSource = {} as any;

    const auth = new AuthService(users, sessions, verificationTokens, resetTokens, auditLogs, mail, jwt, config, dataSource);

    sessions.findOne.mockResolvedValue(null);

    await expect(
      auth.revokeSession('user-1', 'session-other', 'session-current')
    ).rejects.toThrow(UnauthorizedException);
  });

  it('successfully revokes an active session belonging to user and audits the event', async () => {
    const users = createMockRepo();
    const sessions = createMockRepo();
    const verificationTokens = createMockRepo();
    const resetTokens = createMockRepo();
    const auditLogs = createMockRepo();
    const mail = { send: vi.fn() } as any;
    const jwt = { signAsync: vi.fn() } as any;
    const config = { get: vi.fn(), getOrThrow: vi.fn() } as any;
    const dataSource = {} as any;

    const auth = new AuthService(users, sessions, verificationTokens, resetTokens, auditLogs, mail, jwt, config, dataSource);

    sessions.findOne.mockResolvedValue({ id: 'session-target', userId: 'user-1', status: 'active' });

    const result = await auth.revokeSession('user-1', 'session-target', 'session-current');
    expect(result.success).toBe(true);
    expect(result.revokedSessionId).toBe('session-target');
    expect(sessions.update).toHaveBeenCalledWith('session-target', expect.objectContaining({ status: 'revoked' }));
    expect(auditLogs.save).toHaveBeenCalled();
  });
});
