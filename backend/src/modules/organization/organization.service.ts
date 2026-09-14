import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Organization } from '../../database/entities/identity/organization.entity';
import { OrganizationMember } from '../../database/entities/identity/organization-member.entity';
import { OrganizationRole } from '../../database/entities/identity/organization-role.entity';
import { OrganizationMemberRole } from '../../database/entities/identity/org-member-role.entity';
import { OrganizationRolePermission } from '../../database/entities/identity/org-role-permission.entity';
import { Department } from '../../database/entities/identity/department.entity';
import { DepartmentMember } from '../../database/entities/identity/department-member.entity';
import { Group } from '../../database/entities/identity/group.entity';
import { GroupMember } from '../../database/entities/identity/group-member.entity';
import { OrganizationInvitation } from '../../database/entities/identity/organization-invitation.entity';
import { User } from '../../database/entities/identity/user.entity';
import { generateSecureToken, hashToken } from '../../common/utils/token.util';
import { AddMemberDto, AssignOrgRoleDto, CreateDepartmentDto, CreateGroupDto, CreateOrgRoleDto, CreateOrganizationDto, InviteMemberDto, UpdateDepartmentDto, UpdateGroupDto, UpdateOrganizationDto } from './dto/organization.dto';
import { ORG_PERMISSIONS } from '../../common/constants/permission-keys';
import { buildParentMap, detectCycle } from '../../common/utils/cycle-detector.util';
import { MailService } from '../mail/mail.service';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization) private readonly organizations: Repository<Organization>,
    @InjectRepository(OrganizationMember) private readonly members: Repository<OrganizationMember>,
    @InjectRepository(OrganizationInvitation) private readonly invitations: Repository<OrganizationInvitation>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(OrganizationRole) private readonly roles: Repository<OrganizationRole>,
    @InjectRepository(OrganizationMemberRole) private readonly memberRoles: Repository<OrganizationMemberRole>,
    @InjectRepository(OrganizationRolePermission) private readonly rolePermissions: Repository<OrganizationRolePermission>,
    @InjectRepository(Department) private readonly departments: Repository<Department>,
    @InjectRepository(DepartmentMember) private readonly departmentMembers: Repository<DepartmentMember>,
    @InjectRepository(Group) private readonly groups: Repository<Group>,
    @InjectRepository(GroupMember) private readonly groupMembers: Repository<GroupMember>,
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
    @Optional() private readonly mail?: MailService,
  ) {}

  async create(userId: string, input: CreateOrganizationDto) {
    const key = input.key.trim().toLowerCase();
    const existing = await this.organizations.findOne({ where: { key } });
    if (existing) throw new ConflictException('Organization key already exists');

    return this.dataSource.transaction(async (manager) => {
      const organization = await manager.save(
        Organization,
        manager.create(Organization, {
          key,
          name: input.name.trim(),
          status: 'active',
        }),
      );

      const member = await manager.save(
        OrganizationMember,
        manager.create(OrganizationMember, {
          orgId: organization.id,
          userId,
          status: 'active',
          joinedAt: new Date(),
        }),
      );

      const adminRole = await manager.save(
        OrganizationRole,
        manager.create(OrganizationRole, {
          orgId: organization.id,
          key: 'org-admin',
          name: 'Organization Admin',
          description: 'Full administrative access to the organization',
        }),
      );

      const memberRole = await manager.save(
        OrganizationRole,
        manager.create(OrganizationRole, {
          orgId: organization.id,
          key: 'member',
          name: 'Member',
          description: 'Standard member access',
        }),
      );

      const allPermissions = Object.values(ORG_PERMISSIONS);
      await manager.save(
        OrganizationRolePermission,
        allPermissions.map((permissionKey) =>
          manager.create(OrganizationRolePermission, {
            roleId: adminRole.id,
            permissionKey,
          }),
        ),
      );

      const memberPermissions = [
        ORG_PERMISSIONS.CREATE_PROJECT,
      ];
      await manager.save(
        OrganizationRolePermission,
        memberPermissions.map((permissionKey) =>
          manager.create(OrganizationRolePermission, {
            roleId: memberRole.id,
            permissionKey,
          }),
        ),
      );

      await manager.save(
        OrganizationMemberRole,
        manager.create(OrganizationMemberRole, {
          orgMemberId: member.id,
          roleId: adminRole.id,
          grantedByMemberId: member.id,
        }),
      );

      return organization;
    });
  }

  async listForUser(userId: string) {
    return this.members.createQueryBuilder('member')
      .innerJoin(Organization, 'org', 'org.id = member.org_id')
      .where('member.user_id = :userId AND member.status = :status', { userId, status: 'active' })
      .select('org.id', 'orgId')
      .addSelect('org.id', 'id')
      .addSelect('org.key', 'key')
      .addSelect('org.name', 'name')
      .addSelect('org.status', 'status')
      .addSelect('org.created_at', 'createdAt')
      .addSelect('member.id', 'memberId')
      .orderBy('org.name', 'ASC')
      .getRawMany();
  }

  async get(orgId: string) {
    const organization = await this.organizations.findOne({ where: { id: orgId } });
    if (!organization) throw new NotFoundException('Organization not found');
    return organization;
  }

  async update(orgId: string, input: UpdateOrganizationDto) {
    const organization = await this.organizations.findOne({ where: { id: orgId } });
    if (!organization) throw new NotFoundException('Organization not found');
    organization.name = input.name.trim();
    if (input.status) organization.status = input.status;
    return this.organizations.save(organization);
  }

  async listMembers(orgId: string) {
    const rawMembers = await this.members.createQueryBuilder('member')
      .innerJoin(User, 'user', 'user.id = member.user_id')
      .where('member.org_id = :orgId', { orgId })
      .select('member.id', 'id')
      .addSelect('member.user_id', 'userId')
      .addSelect('member.status', 'status')
      .addSelect('member.title', 'title')
      .addSelect('member.joined_at', 'joinedAt')
      .addSelect('member.created_at', 'createdAt')
      .addSelect('user.email', 'email')
      .addSelect('user.full_name', 'fullName')
      .addSelect('user.avatar_url', 'avatarUrl')
      .orderBy('user.full_name', 'ASC')
      .getRawMany();

    if (!rawMembers.length) return [];
    const memberIds = rawMembers.map((m) => m.id);

    const deptRows = await this.departmentMembers.createQueryBuilder('dm')
      .innerJoin(Department, 'dept', 'dept.id = dm.department_id')
      .where('dm.org_member_id IN (:...memberIds)', { memberIds })
      .select('dm.org_member_id', 'memberId')
      .addSelect('dept.id', 'departmentId')
      .addSelect('dept.name', 'departmentName')
      .addSelect('dm.role_in_department', 'roleInDepartment')
      .getRawMany();

    const roleRows = await this.memberRoles.createQueryBuilder('mr')
      .innerJoin(OrganizationRole, 'role', 'role.id = mr.role_id')
      .where('mr.org_member_id IN (:...memberIds)', { memberIds })
      .select('mr.org_member_id', 'memberId')
      .addSelect('role.id', 'roleId')
      .addSelect('role.key', 'roleKey')
      .addSelect('role.name', 'roleName')
      .getRawMany();

    const deptMap = new Map<string, any[]>();
    for (const d of deptRows) {
      const list = deptMap.get(d.memberId) || [];
      list.push({ id: d.departmentId, name: d.departmentName, role: d.roleInDepartment });
      deptMap.set(d.memberId, list);
    }

    const roleMap = new Map<string, any[]>();
    for (const r of roleRows) {
      const list = roleMap.get(r.memberId) || [];
      list.push({ id: r.roleId, key: r.roleKey, name: r.roleName });
      roleMap.set(r.memberId, list);
    }

    return rawMembers.map((m) => {
      const assignedRoles = roleMap.get(m.id) || [];
      const primaryRole = assignedRoles[0]?.key || (m.status === 'active' ? 'member' : 'guest');
      return {
        ...m,
        role: primaryRole,
        roles: assignedRoles,
        departments: deptMap.get(m.id) || [],
        user: {
          id: m.userId,
          fullName: m.fullName,
          email: m.email,
          avatarUrl: m.avatarUrl,
        },
      };
    });
  }

  async listRoles(orgId: string) {
    const roles = await this.roles.find({ where: { orgId }, order: { key: 'ASC' } });
    if (!roles.length) return [];
    const roleIds = roles.map((r) => r.id);
    const permissions = await this.rolePermissions.createQueryBuilder('rp')
      .where('rp.role_id IN (:...roleIds)', { roleIds })
      .orderBy('rp.permission_key', 'ASC')
      .getMany();
    const permMap = new Map<string, string[]>();
    for (const p of permissions) {
      const list = permMap.get(p.roleId) || [];
      list.push(p.permissionKey);
      permMap.set(p.roleId, list);
    }
    return roles.map((r) => ({
      ...r,
      permissions: permMap.get(r.id) || [],
    }));
  }

  async listInvitations(orgId: string) {
    const invitations = await this.invitations.find({ where: { orgId }, order: { createdAt: 'DESC' }, take: 100 });
    return invitations.map(({ tokenHash: _tokenHash, ...invitation }) => invitation);
  }

  async listDepartments(orgId: string) {
    const departments = await this.departments.find({ where: { orgId }, order: { name: 'ASC' } });
    if (!departments.length) return [];

    const deptIds = departments.map((d) => d.id);
    const counts = await this.departmentMembers.createQueryBuilder('dm')
      .where('dm.department_id IN (:...deptIds)', { deptIds })
      .select('dm.department_id', 'departmentId')
      .addSelect('COUNT(dm.org_member_id)', 'count')
      .groupBy('dm.department_id')
      .getRawMany();
    const countMap = new Map(counts.map((c) => [c.departmentId, Number(c.count)]));

    const leadIds = departments.map((d) => d.leadMemberId).filter(Boolean) as string[];
    let leadMap = new Map<string, any>();
    if (leadIds.length > 0) {
      const leads = await this.members.createQueryBuilder('m')
        .innerJoin(User, 'u', 'u.id = m.user_id')
        .where('m.id IN (:...leadIds)', { leadIds })
        .select('m.id', 'id')
        .addSelect('u.full_name', 'fullName')
        .addSelect('u.email', 'email')
        .addSelect('u.avatar_url', 'avatarUrl')
        .getRawMany();
      leadMap = new Map(leads.map((l) => [l.id, l]));
    }

    return departments.map((d) => ({
      ...d,
      memberCount: countMap.get(d.id) || 0,
      leadMember: d.leadMemberId ? leadMap.get(d.leadMemberId) || null : null,
    }));
  }

  listDepartmentMembers(orgId: string, departmentId: string) {
    return this.departmentMembers.createQueryBuilder('dm')
      .innerJoin(Department, 'department', 'department.id = dm.department_id')
      .innerJoin(OrganizationMember, 'member', 'member.id = dm.org_member_id')
      .innerJoin(User, 'user', 'user.id = member.user_id')
      .where('department.org_id = :orgId AND dm.department_id = :departmentId', { orgId, departmentId })
      .select('dm.org_member_id', 'memberId')
      .addSelect('user.full_name', 'fullName')
      .addSelect('user.email', 'email')
      .addSelect('user.avatar_url', 'avatarUrl')
      .addSelect('member.title', 'title')
      .addSelect('dm.role_in_department', 'roleInDepartment')
      .addSelect('dm.joined_at', 'joinedAt')
      .orderBy('user.full_name', 'ASC')
      .getRawMany();
  }

  listGroups(orgId: string) {
    return this.groups.find({ where: { orgId }, order: { name: 'ASC' } });
  }

  listGroupMembers(orgId: string, groupId: string) {
    return this.groupMembers.createQueryBuilder('gm')
      .innerJoin(Group, 'grp', 'grp.id = gm.group_id')
      .innerJoin(OrganizationMember, 'member', 'member.id = gm.org_member_id')
      .innerJoin(User, 'user', 'user.id = member.user_id')
      .where('grp.org_id = :orgId AND gm.group_id = :groupId', { orgId, groupId })
      .select('gm.org_member_id', 'memberId')
      .addSelect('user.full_name', 'fullName')
      .addSelect('user.email', 'email')
      .getRawMany();
  }

  async invite(orgId: string, inviterMemberId: string, input: InviteMemberDto) {
    const email = input.email.trim().toLowerCase();
    const user = await this.users.findOne({ where: { email } });
    if (user && await this.members.findOne({ where: { orgId, userId: user.id, status: 'active' } })) throw new ConflictException('User is already a member');
    if (input.roleId && !await this.roles.exists({ where: { id: input.roleId, orgId } })) throw new ForbiddenException('Role does not belong to organization');
    const pending = await this.invitations.findOne({ where: { orgId, email, status: 'pending' } });
    if (pending && pending.expiresAt > new Date()) throw new ConflictException('Invitation already exists');
    const raw = generateSecureToken();
    const invitation = await this.invitations.save(this.invitations.create({ orgId, email, invitedByMemberId: inviterMemberId, orgRoleId: input.roleId ?? null, tokenHash: raw.hash, status: 'pending', expiresAt: new Date(Date.now() + 7 * 86400000), acceptedByUserId: null, acceptedAt: null }));

    if (this.mail) {
      const org = await this.organizations.findOne({ where: { id: orgId } });
      const inviterMember = await this.members.findOne({ where: { id: inviterMemberId } });
      const inviterUser = inviterMember ? await this.users.findOne({ where: { id: inviterMember.userId } }) : null;
      const inviterName = inviterUser?.fullName || 'A team administrator';
      await this.mail.sendInvitationEmail(
        email,
        raw.raw,
        org?.name || 'Task Manager Pro',
        inviterName,
        invitation.id,
      ).catch((err) => console.error('[MailService] Failed to send invitation email:', err));
    }

    return { id: invitation.id, email, expiresAt: invitation.expiresAt, ...(this.config.get('NODE_ENV', 'development') === 'development' && { invitationToken: raw.raw }) };
  }

  async revokeInvitation(orgId: string, invitationId: string) {
    const invitation = await this.invitations.findOne({ where: { id: invitationId, orgId, status: 'pending' } });
    if (!invitation) throw new NotFoundException('Pending invitation not found');
    invitation.status = 'revoked';
    return this.invitations.save(invitation);
  }

  /**
   * UC-ORG-10: Org Admin resends an invitation (refreshes token + resets expiry).
   * If previous invitation is still pending, marks it as revoked and issues a new one.
   */
  async resendInvitation(orgId: string, invitationId: string, inviterMemberId: string) {
    const existing = await this.invitations.findOne({ where: { id: invitationId, orgId, status: 'pending' } });
    if (!existing) throw new NotFoundException('Pending invitation not found');
    // Revoke old invitation
    existing.status = 'revoked';
    await this.invitations.save(existing);
    // Issue a fresh invitation
    const raw = generateSecureToken();
    const newInvitation = await this.invitations.save(this.invitations.create({
      orgId,
      email: existing.email,
      invitedByMemberId: inviterMemberId,
      orgRoleId: existing.orgRoleId,
      tokenHash: raw.hash,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 86400000),
      acceptedByUserId: null,
      acceptedAt: null,
    }));

    if (this.mail) {
      const org = await this.organizations.findOne({ where: { id: orgId } });
      const inviterMember = await this.members.findOne({ where: { id: inviterMemberId } });
      const inviterUser = inviterMember ? await this.users.findOne({ where: { id: inviterMember.userId } }) : null;
      const inviterName = inviterUser?.fullName || 'A team administrator';
      await this.mail.sendInvitationEmail(
        newInvitation.email,
        raw.raw,
        org?.name || 'Task Manager Pro',
        inviterName,
        newInvitation.id,
      ).catch((err) => console.error('[MailService] Failed to send resent invitation email:', err));
    }

    return {
      id: newInvitation.id,
      email: newInvitation.email,
      expiresAt: newInvitation.expiresAt,
      ...(this.config.get('NODE_ENV', 'development') === 'development' && { invitationToken: raw.raw }),
    };
  }

  /**
   * List all pending invitations for the logged-in user by email.
   */
  async listUserPendingInvitations(userId: string) {
    const user = await this.users.findOneByOrFail({ id: userId });
    const email = user.email.trim().toLowerCase();
    const now = new Date();
    return this.invitations.createQueryBuilder('inv')
      .innerJoin(Organization, 'org', 'org.id = inv.org_id')
      .leftJoin(OrganizationMember, 'inviter_member', 'inviter_member.id = inv.invited_by_member_id')
      .leftJoin(User, 'inviter_user', 'inviter_user.id = inviter_member.user_id')
      .leftJoin(OrganizationRole, 'role', 'role.id = inv.org_role_id')
      .where('LOWER(inv.email) = :email AND inv.status = :status AND inv.expires_at > :now', {
        email,
        status: 'pending',
        now,
      })
      .select('inv.id', 'id')
      .addSelect('inv.org_id', 'orgId')
      .addSelect('org.name', 'orgName')
      .addSelect('org.key', 'orgKey')
      .addSelect('role.name', 'roleName')
      .addSelect('role.key', 'roleKey')
      .addSelect('inv.created_at', 'createdAt')
      .addSelect('inv.expires_at', 'expiresAt')
      .addSelect('inviter_user.full_name', 'inviterName')
      .orderBy('inv.created_at', 'DESC')
      .getRawMany();
  }

  /**
   * UC-ORG-10: Invitee declines a pending invitation.
   * Supports decline by invitationId, by token, or both.
   */
  async declineInvitation(userId: string, invitationId?: string, token?: string) {
    const user = await this.users.findOneByOrFail({ id: userId });
    let invitation: OrganizationInvitation | null = null;
    if (token) {
      invitation = await this.invitations.findOne({
        where: { tokenHash: hashToken(token), status: 'pending' },
      });
      if (invitationId && invitation && invitation.id !== invitationId) {
        throw new NotFoundException('Invitation not found');
      }
    } else if (invitationId) {
      invitation = await this.invitations.findOne({
        where: { id: invitationId, status: 'pending' },
      });
    } else {
      throw new BadRequestException('Either invitationId or token is required');
    }

    if (!invitation || invitation.expiresAt <= new Date()) throw new NotFoundException('Invitation is invalid or expired');
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) throw new ForbiddenException('Invitation email does not match account');
    invitation.status = 'revoked';
    await this.invitations.save(invitation);
    return { success: true, message: 'Invitation declined' };
  }

  /**
   * UC-ORG-02: Invitee accepts a pending invitation.
   * Supports accept by token (e.g. from email link), by invitationId (e.g. from in-app list), or both.
   */
  async accept(userId: string, invitationId?: string, token?: string) {
    const user = await this.users.findOneByOrFail({ id: userId });
    return this.dataSource.transaction(async (manager) => {
      let invitation: OrganizationInvitation | null = null;
      if (token) {
        invitation = await manager.findOne(OrganizationInvitation, {
          where: { tokenHash: hashToken(token), status: 'pending' },
          lock: { mode: 'pessimistic_write' },
        });
        if (invitationId && invitation && invitation.id !== invitationId) {
          throw new NotFoundException('Invitation not found');
        }
      } else if (invitationId) {
        invitation = await manager.findOne(OrganizationInvitation, {
          where: { id: invitationId, status: 'pending' },
          lock: { mode: 'pessimistic_write' },
        });
      } else {
        throw new BadRequestException('Either invitationId or token is required');
      }

      if (!invitation || invitation.expiresAt <= new Date()) throw new NotFoundException('Invitation is invalid or expired');
      if (user.email.toLowerCase() !== invitation.email.toLowerCase()) throw new ForbiddenException('Invitation email does not match account');
      if (invitation.orgRoleId && !await manager.exists(OrganizationRole, { where: { id: invitation.orgRoleId, orgId: invitation.orgId } })) throw new ForbiddenException('Invitation role is invalid');
      let member = await manager.findOne(OrganizationMember, { where: { orgId: invitation.orgId, userId } });
      if (member?.status === 'active') throw new ConflictException('User is already a member');
      member = await manager.save(OrganizationMember, manager.create(OrganizationMember, { ...member, orgId: invitation.orgId, userId, status: 'active', joinedAt: new Date(), invitedByMemberId: invitation.invitedByMemberId }));
      invitation.status = 'accepted';
      invitation.acceptedByUserId = userId;
      invitation.acceptedAt = new Date();
      await manager.save(invitation);
      const role = invitation.orgRoleId
        ? await manager.findOneByOrFail(OrganizationRole, { id: invitation.orgRoleId, orgId: invitation.orgId })
        : await manager.findOneByOrFail(OrganizationRole, { orgId: invitation.orgId, key: 'member' });
      await manager.save(OrganizationMemberRole, manager.create(OrganizationMemberRole, { orgMemberId: member.id, roleId: role.id, grantedByMemberId: invitation.invitedByMemberId }));
      const org = await manager.findOne(Organization, { where: { id: invitation.orgId } });
      return { member, organization: org };
    });
  }

  async updateMemberStatus(orgId: string, memberId: string, status: 'active' | 'suspended') {
    const member = await this.members.findOne({ where: { id: memberId, orgId } });
    if (!member) throw new NotFoundException('Organization member not found');
    if (member.status === status) return member;
    if (status === 'suspended') {
      const adminRole = await this.roles.findOne({ where: { orgId, key: 'org-admin' } });
      if (adminRole && await this.memberRoles.exists({ where: { orgMemberId: member.id, roleId: adminRole.id } })) {
        const activeAdmins = await this.memberRoles.createQueryBuilder('grant')
          .innerJoin(OrganizationMember, 'member', 'member.id = grant.org_member_id AND member.status = :status', { status: 'active' })
          .where('member.org_id = :orgId AND grant.role_id = :roleId', { orgId, roleId: adminRole.id })
          .getCount();
        if (activeAdmins <= 1) throw new ConflictException('Cannot suspend the last organization administrator');
      }
    }
    member.status = status;
    if (status === 'active' && !member.joinedAt) member.joinedAt = new Date();
    return this.members.save(member);
  }

  /**
   * UC-ORG-11: Organization member voluntarily leaves the organization.
   * Guard: Prevents the last active Org Admin from leaving (would orphan the org).
   * Cascade: Revokes all active PATs for this member in this org.
   */
  async leaveOrganization(orgId: string, userId: string) {
    const member = await this.members.findOne({ where: { orgId, userId, status: 'active' } });
    if (!member) throw new NotFoundException('You are not an active member of this organization');

    // Guard: block if this is the last active org-admin
    const adminRole = await this.roles.findOne({ where: { orgId, key: 'org-admin' } });
    if (adminRole && await this.memberRoles.exists({ where: { orgMemberId: member.id, roleId: adminRole.id } })) {
      const activeAdmins = await this.memberRoles.createQueryBuilder('grant')
        .innerJoin(OrganizationMember, 'om', 'om.id = grant.org_member_id AND om.status = :status', { status: 'active' })
        .where('om.org_id = :orgId AND grant.role_id = :roleId', { orgId, roleId: adminRole.id })
        .getCount();
      if (activeAdmins <= 1) {
        throw new ConflictException('Cannot leave organization: you are the last administrator. Transfer admin rights before leaving.');
      }
    }

    // Cascade: revoke all active PATs for this member in this org
    await this.dataSource.query(
      `UPDATE api_tokens SET revoked_at = NOW() WHERE org_id = $1 AND member_id = $2 AND revoked_at IS NULL`,
      [orgId, member.id],
    );

    // Mark member as suspended (soft-remove preserving audit history)
    member.status = 'suspended';
    await this.members.save(member);

    return { success: true, message: 'You have left the organization' };
  }

  async createDepartment(orgId: string, input: CreateDepartmentDto) {
    if (input.parentDepartmentId && !await this.departments.exists({ where: { id: input.parentDepartmentId, orgId } })) throw new NotFoundException('Parent department not found');
    if (input.leadMemberId && !await this.members.exists({ where: { id: input.leadMemberId, orgId, status: 'active' } })) throw new NotFoundException('Lead member not found in organization');
    const dept = await this.departments.save(this.departments.create({
      orgId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      parentDepartmentId: input.parentDepartmentId ?? null,
      leadMemberId: input.leadMemberId ?? null,
    }));
    if (input.leadMemberId) {
      await this.departmentMembers.save(this.departmentMembers.create({
        departmentId: dept.id,
        orgMemberId: input.leadMemberId,
        roleInDepartment: 'LEAD',
      }));
    }
    return dept;
  }

  async addDepartmentMember(orgId: string, departmentId: string, input: AddMemberDto) {
    const department = await this.departments.findOne({ where: { id: departmentId, orgId } });
    const member = await this.members.findOne({ where: { id: input.memberId, orgId, status: 'active' } });
    if (!department || !member) throw new NotFoundException('Department or member not found');
    const roleInDept = input.roleInDepartment?.trim() || 'MEMBER';
    const existing = await this.departmentMembers.findOne({ where: { departmentId, orgMemberId: input.memberId } });
    if (existing) {
      existing.roleInDepartment = roleInDept;
      return this.departmentMembers.save(existing);
    }
    return this.departmentMembers.save(this.departmentMembers.create({
      departmentId,
      orgMemberId: input.memberId,
      roleInDepartment: roleInDept,
    }));
  }

  async updateDepartment(orgId: string, departmentId: string, input: UpdateDepartmentDto) {
    const department = await this.departments.findOne({ where: { id: departmentId, orgId } });
    if (!department) throw new NotFoundException('Department not found');
    if (input.parentDepartmentId === departmentId) throw new ConflictException('Department cannot be its own parent');
    if (input.parentDepartmentId && !await this.departments.exists({ where: { id: input.parentDepartmentId, orgId } })) throw new NotFoundException('Parent department not found');
    if (input.leadMemberId && !await this.members.exists({ where: { id: input.leadMemberId, orgId, status: 'active' } })) throw new NotFoundException('Lead member not found in organization');
    if (input.parentDepartmentId !== undefined && input.parentDepartmentId !== null) {
      const allDepartments = await this.departments.find({ where: { orgId } });
      const parentMap = buildParentMap(allDepartments.map((item) => ({ id: item.id, parentId: item.parentDepartmentId })));
      if (detectCycle(departmentId, input.parentDepartmentId, (id) => parentMap.get(id) ?? null)) throw new ConflictException('Department parent would create a cycle');
    }
    department.name = input.name.trim();
    if (input.description !== undefined) department.description = input.description?.trim() || null;
    if (input.parentDepartmentId !== undefined) department.parentDepartmentId = input.parentDepartmentId;
    if (input.leadMemberId !== undefined) {
      department.leadMemberId = input.leadMemberId;
      if (input.leadMemberId) {
        const existing = await this.departmentMembers.findOne({ where: { departmentId, orgMemberId: input.leadMemberId } });
        if (existing) {
          existing.roleInDepartment = 'LEAD';
          await this.departmentMembers.save(existing);
        } else {
          await this.departmentMembers.save(this.departmentMembers.create({
            departmentId,
            orgMemberId: input.leadMemberId,
            roleInDepartment: 'LEAD',
          }));
        }
      }
    }
    return this.departments.save(department);
  }

  async removeDepartmentMember(orgId: string, departmentId: string, memberId: string) {
    const department = await this.departments.findOne({ where: { id: departmentId, orgId } });
    if (!department) throw new NotFoundException('Department not found');
    await this.departmentMembers.delete({ departmentId, orgMemberId: memberId });
    return { success: true };
  }

  async createGroup(orgId: string, input: CreateGroupDto) {
    return this.groups.save(this.groups.create({ orgId, name: input.name.trim(), description: input.description?.trim() ?? null }));
  }

  async addGroupMember(orgId: string, groupId: string, actorMemberId: string, input: AddMemberDto) {
    const group = await this.groups.findOne({ where: { id: groupId, orgId } });
    const member = await this.members.findOne({ where: { id: input.memberId, orgId, status: 'active' } });
    if (!group || !member) throw new NotFoundException('Group or member not found');
    return this.groupMembers.save(this.groupMembers.create({ groupId, orgMemberId: input.memberId, addedByMemberId: actorMemberId }));
  }

  async updateGroup(orgId: string, groupId: string, input: UpdateGroupDto) {
    const group = await this.groups.findOne({ where: { id: groupId, orgId } });
    if (!group) throw new NotFoundException('Group not found');
    group.name = input.name.trim();
    if (input.description !== undefined) group.description = input.description?.trim() || null;
    return this.groups.save(group);
  }

  async removeGroupMember(orgId: string, groupId: string, memberId: string) {
    const group = await this.groups.findOne({ where: { id: groupId, orgId } });
    if (!group) throw new NotFoundException('Group not found');
    await this.groupMembers.delete({ groupId, orgMemberId: memberId });
    return { success: true };
  }

  async createRole(orgId: string, input: CreateOrgRoleDto) {
    const permissionKeys = input.permissionKeys ?? [];
    this.validateOrgPermissions(permissionKeys);
    const role = await this.roles.save(this.roles.create({ orgId, key: input.key.trim().toLowerCase(), name: input.name.trim(), description: input.description?.trim() ?? null }));
    if (permissionKeys.length) await this.rolePermissions.save(permissionKeys.map((permissionKey) => this.rolePermissions.create({ roleId: role.id, permissionKey })));
    return role;
  }

  async assignRole(orgId: string, input: AssignOrgRoleDto) {
    const [member, role] = await Promise.all([
      this.members.findOne({ where: { id: input.memberId, orgId } }),
      this.roles.findOne({ where: { id: input.roleId, orgId } }),
    ]);
    if (!member || !role) throw new NotFoundException('Organization member or role not found');
    const existing = await this.memberRoles.findOne({ where: { orgMemberId: member.id, roleId: role.id } });
    return existing ?? this.memberRoles.save(this.memberRoles.create({ orgMemberId: member.id, roleId: role.id, grantedByMemberId: member.id }));
  }

  async setRolePermissions(orgId: string, roleId: string, permissionKeys: string[]) {
    const role = await this.roles.findOne({ where: { id: roleId, orgId } });
    if (!role) throw new NotFoundException('Organization role not found');
    this.validateOrgPermissions(permissionKeys);
    if (new Set(permissionKeys).size !== permissionKeys.length) throw new ConflictException('Role permissions contain duplicates');
    await this.rolePermissions.delete({ roleId });
    if (permissionKeys.length) await this.rolePermissions.save(permissionKeys.map((permissionKey) => this.rolePermissions.create({ roleId, permissionKey })));
    return this.rolePermissions.find({ where: { roleId }, order: { permissionKey: 'ASC' } });
  }

  async getRolePermissions(orgId: string, roleId: string) {
    if (!await this.roles.exists({ where: { id: roleId, orgId } })) throw new NotFoundException('Organization role not found');
    return this.rolePermissions.find({ where: { roleId }, order: { permissionKey: 'ASC' } });
  }

  private validateOrgPermissions(permissionKeys: string[]) {
    if (permissionKeys.some((permission) => !Object.values(ORG_PERMISSIONS).includes(permission as typeof ORG_PERMISSIONS[keyof typeof ORG_PERMISSIONS]))) {
      throw new ConflictException('Role contains an unknown organization permission');
    }
  }
}
