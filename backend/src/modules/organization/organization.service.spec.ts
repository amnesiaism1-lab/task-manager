import { describe, expect, it, vi } from 'vitest';
import { OrganizationService } from './organization.service';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

function createMockRepo() {
  return {
    find: vi.fn(),
    findOne: vi.fn(),
    findOneByOrFail: vi.fn(),
    save: vi.fn(async (e) => e),
    create: vi.fn((e) => e),
    exists: vi.fn(),
    createQueryBuilder: vi.fn(),
  } as any;
}

describe('OrganizationService - Lifecycle & Self-Serve', () => {
  function setup() {
    const orgs = createMockRepo();
    const members = createMockRepo();
    const invitations = createMockRepo();
    const users = createMockRepo();
    const roles = createMockRepo();
    const memberRoles = createMockRepo();
    const rolePermissions = createMockRepo();
    const departments = createMockRepo();
    const departmentMembers = createMockRepo();
    const groups = createMockRepo();
    const groupMembers = createMockRepo();
    const dataSource = {
      query: vi.fn().mockResolvedValue([]),
      transaction: vi.fn(async (cb) => cb({
        save: vi.fn(async (e) => e),
        findOne: vi.fn(),
        findOneByOrFail: vi.fn(),
        create: vi.fn((cls, data) => data),
        exists: vi.fn(),
      })),
    } as any;
    const config = { get: vi.fn().mockReturnValue('development') } as any;

    const service = new OrganizationService(
      orgs, members, invitations, users, roles, memberRoles,
      rolePermissions, departments, departmentMembers, groups, groupMembers,
      dataSource, config
    );

    return { service, orgs, members, invitations, users, roles, memberRoles, dataSource };
  }

  describe('UC-ORG-10: resendInvitation', () => {
    it('throws NotFoundException if invitation does not exist or is not pending', async () => {
      const { service, invitations } = setup();
      invitations.findOne.mockResolvedValue(null);

      await expect(
        service.resendInvitation('org-1', 'inv-1', 'member-1')
      ).rejects.toThrow(NotFoundException);
    });

    it('revokes existing invitation and generates a fresh one with token', async () => {
      const { service, invitations } = setup();
      invitations.findOne.mockResolvedValue({
        id: 'inv-1',
        orgId: 'org-1',
        email: 'colleague@test.com',
        orgRoleId: 'role-member',
        status: 'pending',
      });

      const result = await service.resendInvitation('org-1', 'inv-1', 'member-1');
      expect(invitations.save).toHaveBeenCalledTimes(2); // once for revoking old, once for creating new
      expect(result.email).toBe('colleague@test.com');
      expect(result.invitationToken).toBeDefined();
    });
  });

  describe('UC-ORG-10: declineInvitation', () => {
    it('throws ForbiddenException if invitee email does not match user account', async () => {
      const { service, users, invitations } = setup();
      users.findOneByOrFail.mockResolvedValue({ id: 'user-1', email: 'user@test.com' });
      invitations.findOne.mockResolvedValue({
        id: 'inv-1',
        email: 'different@test.com',
        expiresAt: new Date(Date.now() + 100000),
        status: 'pending',
      });

      await expect(
        service.declineInvitation('user-1', 'inv-1', 'raw-token')
      ).rejects.toThrow(ForbiddenException);
    });

    it('marks invitation as revoked on valid decline', async () => {
      const { service, users, invitations } = setup();
      users.findOneByOrFail.mockResolvedValue({ id: 'user-1', email: 'user@test.com' });
      const pendingInv = {
        id: 'inv-1',
        email: 'user@test.com',
        expiresAt: new Date(Date.now() + 100000),
        status: 'pending',
      };
      invitations.findOne.mockResolvedValue(pendingInv);

      const result = await service.declineInvitation('user-1', 'inv-1', 'raw-token');
      expect(result.success).toBe(true);
      expect(pendingInv.status).toBe('revoked');
      expect(invitations.save).toHaveBeenCalledWith(pendingInv);
    });
  });

  describe('UC-ORG-11: leaveOrganization', () => {
    it('blocks the last active org-admin from leaving', async () => {
      const { service, members, roles, memberRoles } = setup();
      members.findOne.mockResolvedValue({ id: 'm-1', orgId: 'org-1', userId: 'u-1', status: 'active' });
      roles.findOne.mockResolvedValue({ id: 'role-admin', key: 'org-admin' });
      memberRoles.exists.mockResolvedValue(true);

      const qb = {
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getCount: vi.fn().mockResolvedValue(1), // Only 1 active admin!
      };
      memberRoles.createQueryBuilder.mockReturnValue(qb);

      await expect(
        service.leaveOrganization('org-1', 'u-1')
      ).rejects.toThrow(ConflictException);
    });

    it('allows leaving if there are other active admins, revoking PATs and updating status', async () => {
      const { service, members, roles, memberRoles, dataSource } = setup();
      const member = { id: 'm-1', orgId: 'org-1', userId: 'u-1', status: 'active' };
      members.findOne.mockResolvedValue(member);
      roles.findOne.mockResolvedValue({ id: 'role-admin', key: 'org-admin' });
      memberRoles.exists.mockResolvedValue(true);

      const qb = {
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getCount: vi.fn().mockResolvedValue(2), // 2 active admins, safe to leave
      };
      memberRoles.createQueryBuilder.mockReturnValue(qb);

      const result = await service.leaveOrganization('org-1', 'u-1');
      expect(result.success).toBe(true);
      expect(dataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE api_tokens SET revoked_at'),
        ['org-1', 'm-1']
      );
      expect(member.status).toBe('suspended');
      expect(members.save).toHaveBeenCalledWith(member);
    });
  });
});
