import { ConflictException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { User } from '../../database/entities/identity/user.entity';
import { AuthSession } from '../../database/entities/identity/auth-session.entity';
import { Organization } from '../../database/entities/identity/organization.entity';
import { ListUsersQueryDto, AdminUpdateOrganizationDto, AdminCreateUserDto, AdminUpdateUserDto, AdminTestMailDto } from './dto/admin.dto';
import { hashPassword } from '../../common/utils/password.util';
import { generateSecureToken } from '../../common/utils/token.util';
import { MailService } from '../mail/mail.service';

/**
 * AdminService — Platform-level System Admin operations.
 * Implements UC-SYS-01 (Global User Management) and UC-SYS-02 (Global Org Management).
 * All methods require callers to have isSystemAdmin = true (enforced by SystemAdminGuard).
 */
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(AuthSession) private readonly sessions: Repository<AuthSession>,
    @InjectRepository(Organization) private readonly organizations: Repository<Organization>,
    private readonly dataSource: DataSource,
    @Optional() private readonly mail?: MailService,
  ) {}

  // ─── UC-SYS-01: Global User Directory ───────────────────────────────────────

  /**
   * UC-SYS-01: List and search all users across the platform.
   * Supports filtering by email prefix (case-insensitive) and status.
   */
  async listUsers(query: ListUsersQueryDto) {
    const page = Math.max(1, parseInt(query.page ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10)));
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.status) where['status'] = query.status;
    if (query.email) where['email'] = ILike(`%${query.email}%`);

    const [items, total] = await this.users.findAndCount({
      where,
      select: { id: true, email: true, fullName: true, avatarUrl: true, status: true, emailVerifiedAt: true, lastLoginAt: true, isSystemAdmin: true, createdAt: true },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * UC-SYS-01: Get details of a specific user including active session count.
   */
  async getUser(userId: string) {
    const user = await this.users.findOne({
      where: { id: userId },
      select: { id: true, email: true, fullName: true, avatarUrl: true, status: true, emailVerifiedAt: true, lastLoginAt: true, isSystemAdmin: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const activeSessionCount = await this.sessions.count({ where: { userId, status: 'active' } });
    return { ...user, activeSessionCount };
  }

  /**
   * Create a new platform user directly from Admin console.
   */
  async createUser(actorUserId: string, input: AdminCreateUserDto) {
    const email = input.email.trim().toLowerCase();
    if (await this.users.exists({ where: { email } })) {
      throw new ConflictException('Email is already in use by another account');
    }
    const rawPassword = input.password?.trim() || generateSecureToken(16).raw;
    const passwordHash = await hashPassword(rawPassword);

    const user = await this.users.save(this.users.create({
      email,
      fullName: input.fullName.trim(),
      passwordHash,
      status: input.status ?? 'active',
      isSystemAdmin: input.isSystemAdmin ?? false,
      emailVerifiedAt: input.sendVerificationEmail ? null : new Date(),
      lastLoginAt: null,
      avatarUrl: null,
    }));

    if (input.sendVerificationEmail && this.mail) {
      const token = generateSecureToken();
      await this.dataSource.query(
        `INSERT INTO email_verification_tokens (id, user_id, email, token_hash, expires_at, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())`,
        [user.id, email, token.hash, new Date(Date.now() + 24 * 60 * 60 * 1000)],
      );
      await this.mail.sendVerificationEmail(
        email,
        token.raw,
        user.fullName,
      ).catch((err) => console.error('[MailService] Failed to send verification email for created user:', err));
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      status: user.status,
      isSystemAdmin: user.isSystemAdmin,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      temporaryPassword: input.password ? undefined : rawPassword,
    };
  }

  /**
   * Update an existing platform user (profile, role, status, password).
   */
  async updateUser(actorUserId: string, targetUserId: string, input: AdminUpdateUserDto) {
    const user = await this.users.findOne({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException('User not found');

    if (actorUserId === targetUserId) {
      if (input.isSystemAdmin === false) {
        throw new ConflictException('You cannot revoke your own system administrator role');
      }
      if (input.status && input.status !== 'active') {
        throw new ConflictException('System administrators cannot deactivate or suspend their own account');
      }
    }

    if (input.email) {
      const newEmail = input.email.trim().toLowerCase();
      if (newEmail !== user.email) {
        const exists = await this.users.findOne({ where: { email: newEmail } });
        if (exists && exists.id !== targetUserId) {
          throw new ConflictException('Email is already in use by another account');
        }
        user.email = newEmail;
      }
    }

    if (input.fullName !== undefined) {
      user.fullName = input.fullName.trim();
    }
    if (input.isSystemAdmin !== undefined) {
      user.isSystemAdmin = input.isSystemAdmin;
    }
    if (input.avatarUrl !== undefined) {
      user.avatarUrl = input.avatarUrl || null;
    }

    let passwordChanged = false;
    if (input.password && input.password.trim().length >= 8) {
      user.passwordHash = await hashPassword(input.password.trim());
      passwordChanged = true;
    }

    const oldStatus = user.status;
    if (input.status) {
      user.status = input.status;
    }

    await this.users.save(user);

    // If status changed to suspended/deactivated, or password changed, revoke sessions
    if ((input.status && input.status !== 'active' && oldStatus === 'active') || passwordChanged) {
      await this.sessions.update(
        { userId: targetUserId, status: 'active' },
        { status: 'revoked', revokedAt: new Date() },
      );
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      status: user.status,
      isSystemAdmin: user.isSystemAdmin,
      avatarUrl: user.avatarUrl,
      emailVerifiedAt: user.emailVerifiedAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Delete or deactivate a user with database constraint protection.
   * Prevents deleting the sole Org Admin of any organization.
   */
  async deleteUser(actorUserId: string, targetUserId: string) {
    if (actorUserId === targetUserId) {
      throw new ConflictException('System administrators cannot delete their own account');
    }
    const user = await this.users.findOne({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException('User not found');

    // Constraint check: Verify user is not the sole Org Admin of any organization
    const memberships: Array<{ org_id: string; org_name: string }> = await this.dataSource.query(`
      SELECT om.org_id, o.name as org_name
      FROM organization_members om
      JOIN org_member_roles omr ON omr.org_member_id = om.id
      JOIN org_roles r ON r.id = omr.role_id
      JOIN organizations o ON o.id = om.org_id
      WHERE om.user_id = $1 AND r.key = 'org-admin' AND om.status = 'active'
    `, [targetUserId]);

    for (const m of memberships) {
      const adminCount = await this.dataSource.query(`
        SELECT COUNT(DISTINCT om.user_id) as count
        FROM organization_members om
        JOIN org_member_roles omr ON omr.org_member_id = om.id
        JOIN org_roles r ON r.id = omr.role_id
        WHERE om.org_id = $1 AND r.key = 'org-admin' AND om.status = 'active'
      `, [m.org_id]);
      if (parseInt(adminCount[0]?.count ?? '0', 10) <= 1) {
        throw new ConflictException(`Cannot delete user: user is the sole administrator of organization "${m.org_name}". Transfer org ownership first.`);
      }
    }

    await this.dataSource.transaction(async (manager) => {
      // Clear all active sessions and authentication tokens
      await manager.query('DELETE FROM auth_sessions WHERE user_id = $1', [targetUserId]);
      await manager.query('DELETE FROM email_verification_tokens WHERE user_id = $1', [targetUserId]);
      await manager.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [targetUserId]);
      await manager.query('DELETE FROM api_tokens WHERE member_id IN (SELECT id FROM organization_members WHERE user_id = $1)', [targetUserId]);

      // Check for related records in organization memberships (issues, comments) that restrict hard deletion
      const hasMemberRecords = await manager.query(`
        SELECT 1 FROM organization_members om
        WHERE om.user_id = $1
        AND (
          EXISTS (SELECT 1 FROM issues i WHERE i.reporter_member_id = om.id OR i.assignee_member_id = om.id)
          OR EXISTS (SELECT 1 FROM comments c WHERE c.author_member_id = om.id)
        ) LIMIT 1
      `, [targetUserId]);

      if (hasMemberRecords.length > 0) {
        // Obfuscate and deactivate to preserve relational audit history
        await manager.update(User, targetUserId, {
          status: 'deactivated',
          email: `deleted_${Date.now()}_${user.email}`,
          avatarUrl: null,
        });
        await manager.query('UPDATE organization_members SET status = $1 WHERE user_id = $2', ['suspended', targetUserId]);
      } else {
        // Safe to remove memberships and hard delete user
        await manager.query('DELETE FROM org_member_roles WHERE org_member_id IN (SELECT id FROM organization_members WHERE user_id = $1)', [targetUserId]);
        await manager.query('DELETE FROM organization_members WHERE user_id = $1', [targetUserId]);
        await manager.delete(User, targetUserId);
      }
    });

    return { success: true, message: `User ${user.email} successfully deleted/deactivated` };
  }

  /**
   * UC-SYS-01: Update a user's account status (suspend / activate).
   * Guard: System Admin cannot suspend themselves (self-lockout protection).
   */
  async updateUserStatus(actorUserId: string, targetUserId: string, status: 'active' | 'deactivated' | 'suspended') {
    if (actorUserId === targetUserId) {
      throw new ConflictException('System administrators cannot change their own account status');
    }
    const user = await this.users.findOne({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException('User not found');

    await this.dataSource.transaction(async (manager) => {
      await manager.update(User, targetUserId, { status });
      // Revoke all active sessions when suspending or deactivating
      if (status === 'suspended' || status === 'deactivated') {
        await manager.update(AuthSession, { userId: targetUserId, status: 'active' }, { status: 'revoked', revokedAt: new Date() });
      }
    });

    return { success: true, userId: targetUserId, status };
  }

  /**
   * UC-SYS-01: Force-revoke all active sessions for any user.
   * Used when a security incident is detected for a specific account.
   * Guard: System Admin cannot revoke their own sessions via this endpoint.
   */
  async forceRevokeAllSessions(actorUserId: string, targetUserId: string) {
    if (actorUserId === targetUserId) {
      throw new ConflictException('Use /auth/logout-all to revoke your own sessions');
    }
    const user = await this.users.findOne({ where: { id: targetUserId } });
    if (!user) throw new NotFoundException('User not found');

    const result = await this.sessions.update(
      { userId: targetUserId, status: 'active' },
      { status: 'revoked', revokedAt: new Date() },
    );

    return { success: true, userId: targetUserId, revokedCount: result.affected ?? 0 };
  }

  // ─── UC-SYS-02: Global Organization Management ──────────────────────────────

  /**
   * UC-SYS-02: List all organizations (tenants) on the platform.
   */
  async listOrganizations(page = 1, limit = 20) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const [items, total] = await this.organizations.findAndCount({
      order: { createdAt: 'DESC' },
      take: safeLimit,
      skip: (safePage - 1) * safeLimit,
    });
    return { items, total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) };
  }

  /**
   * UC-SYS-02: Get details of a specific organization.
   */
  async getOrganization(orgId: string) {
    const org = await this.organizations.findOne({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  /**
   * UC-SYS-02: Update an organization's status (active/suspended) or service plan.
   * Suspending an organization prevents all member write operations.
   */
  async updateOrganization(orgId: string, input: AdminUpdateOrganizationDto) {
    const org = await this.organizations.findOne({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organization not found');

    if (input.status !== undefined) org.status = input.status;
    if (input.plan !== undefined) org.plan = input.plan;

    return this.organizations.save(org);
  }

  // ─── Mail Operations & Outbox ────────────────────────────────────────────────

  async sendTestMail(actorUserId: string, input: AdminTestMailDto) {
    if (!this.mail) {
      return { success: false, message: 'MailService is not available' };
    }
    const result = await this.mail.sendTestEmail(input.to, input.subject);
    return {
      success: true,
      message: `Test email sent to ${input.to}`,
      result,
    };
  }

  getMailOutbox() {
    if (!this.mail) return [];
    return this.mail.getRecentMails();
  }
}
