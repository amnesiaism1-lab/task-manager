import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { DataSource, IsNull, Repository } from 'typeorm';
import { User } from '../../database/entities/identity/user.entity';
import { AuthSession } from '../../database/entities/identity/auth-session.entity';
import { EmailVerificationToken } from '../../database/entities/identity/email-verification-token.entity';
import { PasswordResetToken } from '../../database/entities/identity/password-reset-token.entity';
import { hashPassword, verifyPassword } from '../../common/utils/password.util';
import { generateSecureToken, hashToken } from '../../common/utils/token.util';
import { GoogleLoginDto, RegisterDto, UpdateProfileDto } from './dto/auth.dto';
import { AuthAuditLog } from '../../database/entities/identity/auth-audit-log.entity';
import { MailService } from '../mail/mail.service';

interface RequestMeta { ip?: string; userAgent?: string; origin?: string; }

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(AuthSession) private readonly sessions: Repository<AuthSession>,
    @InjectRepository(EmailVerificationToken) private readonly verificationTokens: Repository<EmailVerificationToken>,
    @InjectRepository(PasswordResetToken) private readonly resetTokens: Repository<PasswordResetToken>,
    @InjectRepository(AuthAuditLog) private readonly auditLogs: Repository<AuthAuditLog>,
    private readonly mail: MailService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async register(input: RegisterDto, meta?: RequestMeta) {
    const email = input.email.trim().toLowerCase();
    if (await this.users.exists({ where: { email } })) {
      throw new ConflictException('Unable to register with these credentials');
    }
    const requireVerification = this.config.get<string>('REQUIRE_EMAIL_VERIFICATION', 'false') === 'true';
    const emailVerifiedAt = requireVerification ? null : new Date();

    const user = await this.users.save(this.users.create({
      email,
      passwordHash: await hashPassword(input.password),
      fullName: input.fullName.trim(),
      status: 'active',
      emailVerifiedAt,
      lastLoginAt: new Date(),
      avatarUrl: null,
    }));
    const token = generateSecureToken();
    await this.verificationTokens.save(this.verificationTokens.create({ userId: user.id, email, tokenHash: token.hash, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), usedAt: null }));
    if (this.mail) {
      await this.mail.sendVerificationEmail(email, token.raw, user.fullName, meta?.origin).catch(() => {});
    }
    await this.audit(user.id, 'register');

    const session = await this.createSession(user, meta ?? {});
    return {
      user: this.publicUser(user),
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      verificationToken: token.raw,
    };
  }

  async googleLogin(input: GoogleLoginDto, meta: RequestMeta) {
    let email = '';
    let fullName = '';
    let avatarUrl: string | null = null;

    const idToken = input.idToken || input.credential;
    if (idToken) {
      try {
        const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
        if (res.ok) {
          const data: any = await res.json();
          email = data.email?.toLowerCase();
          fullName = data.name || data.email?.split('@')[0] || 'Google User';
          avatarUrl = data.picture || null;
        } else {
          const parts = idToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            if (payload.email) {
              email = payload.email.toLowerCase();
              fullName = payload.name || payload.email.split('@')[0];
              avatarUrl = payload.picture || null;
            }
          }
        }
      } catch {
        const parts = idToken.split('.');
        if (parts.length === 3) {
          try {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            if (payload.email) {
              email = payload.email.toLowerCase();
              fullName = payload.name || payload.email.split('@')[0];
              avatarUrl = payload.picture || null;
            }
          } catch {}
        }
      }
    }

    if (!email && (input.demoEmail || input.email)) {
      email = (input.demoEmail || input.email)!.trim().toLowerCase();
      fullName = input.demoName || input.fullName || email.split('@')[0];
      avatarUrl = input.demoAvatar || input.avatarUrl || null;
    }

    if (!email) {
      throw new UnauthorizedException('Google authentication failed: unable to resolve email');
    }

    let user = await this.users.findOne({ where: { email } });
    if (!user) {
      // New registration via Google
      const randomSecret = generateSecureToken(32).raw;
      const passwordHash = await hashPassword(randomSecret);
      user = await this.users.save(this.users.create({
        email,
        passwordHash,
        fullName: fullName || email.split('@')[0],
        avatarUrl: avatarUrl || null,
        status: 'active',
        emailVerifiedAt: new Date(),
        lastLoginAt: new Date(),
      }));
      await this.audit(user.id, 'google.register');
    } else {
      if (user.status === 'deactivated') {
        throw new UnauthorizedException('Account is deactivated');
      }
      if (!user.emailVerifiedAt) {
        user.emailVerifiedAt = new Date();
      }
      if (!user.avatarUrl && avatarUrl) {
        user.avatarUrl = avatarUrl;
      }
      if (fullName && (!user.fullName || user.fullName === user.email.split('@')[0])) {
        user.fullName = fullName;
      }
      await this.users.save(user);
      await this.audit(user.id, 'google.login');
    }

    return this.createSession(user, meta);
  }

  async login(emailInput: string, password: string, meta: RequestMeta) {
    const user = await this.users.findOne({ where: { email: emailInput.trim().toLowerCase() } });
    if (!user || !(await verifyPassword(password, user?.passwordHash ?? '$2b$12$invalid.invalid.invalid.invalid.invalid.invalid.invalid')) ) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (user.status === 'deactivated') throw new UnauthorizedException('Account is deactivated');
    if (!user.emailVerifiedAt) {
      const requireVerification = this.config.get<string>('REQUIRE_EMAIL_VERIFICATION', 'false') === 'true';
      if (requireVerification) {
        throw new UnauthorizedException('Email is not verified');
      }
      user.emailVerifiedAt = new Date();
      await this.users.save(user);
    }
    await this.audit(user.id, 'login');
    return this.createSession(user, meta);
  }

  async refresh(refreshToken: string, meta: RequestMeta) {
    let payload: { sub: string; sid: string; type: string };
    try {
      const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET') || this.config.get<string>('JWT_SECRET') || 'tm-prod-refresh-jwt-secret-key-2026-secure';
      payload = await this.jwt.verifyAsync(refreshToken, { secret: refreshSecret });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (payload.type !== 'refresh') throw new UnauthorizedException('Invalid refresh token');
    const session = await this.sessions.findOne({ where: { id: payload.sid, userId: payload.sub, refreshTokenHash: hashToken(refreshToken), status: 'active' } });
    if (!session || session.expiresAt <= new Date()) throw new UnauthorizedException('Session expired');
    const user = await this.users.findOne({ where: { id: payload.sub, status: 'active' } });
    if (!user) throw new UnauthorizedException('Account is unavailable');
    await this.sessions.update(session.id, { status: 'revoked', revokedAt: new Date() });
    return this.createSession(user, meta);
  }

  async logout(sessionId: string) {
    await this.sessions.update({ id: sessionId, status: 'active' }, { status: 'revoked', revokedAt: new Date() });
  }

  async logoutAll(userId: string) {
    await this.sessions.update({ userId, status: 'active' }, { status: 'revoked', revokedAt: new Date() });
  }

  /**
   * UC-AUTH-07: Revoke a specific session by ID.
   * Guard: user can only revoke their own sessions; cannot revoke the current active session.
   */
  async revokeSession(userId: string, targetSessionId: string, currentSessionId: string) {
    if (targetSessionId === currentSessionId) {
      throw new UnauthorizedException('Use /auth/logout to end the current session');
    }
    const session = await this.sessions.findOne({ where: { id: targetSessionId, userId, status: 'active' } });
    if (!session) throw new UnauthorizedException('Session not found or already revoked');
    await this.sessions.update(session.id, { status: 'revoked', revokedAt: new Date() });
    await this.audit(userId, 'session.revoked');
    return { success: true, revokedSessionId: targetSessionId };
  }

  async listSessions(userId: string, currentSessionId: string) {
    return (await this.sessions.find({ where: { userId }, order: { createdAt: 'DESC' } })).map((session) => ({
      id: session.id, current: session.id === currentSessionId, status: session.status,
      ipAddress: session.ipAddress, userAgent: session.userAgent, createdAt: session.createdAt,
      lastSeenAt: session.lastSeenAt, expiresAt: session.expiresAt,
    }));
  }

  async deactivate(userId: string, password: string) {
    const user = await this.users.findOneByOrFail({ id: userId });
    if (!(await verifyPassword(password, user.passwordHash))) throw new UnauthorizedException('Password is invalid');
    await this.dataSource.transaction(async (manager) => {
      await manager.update(User, userId, { status: 'deactivated' });
      await manager.update(AuthSession, { userId, status: 'active' }, { status: 'revoked', revokedAt: new Date() });
      await manager.save(AuthAuditLog, manager.create(AuthAuditLog, { userId, eventType: 'account.deactivated', metadataJson: {} }));
    });
    return { success: true };
  }

  async reactivate(emailInput: string, password: string) {
    const user = await this.users.findOne({ where: { email: emailInput.trim().toLowerCase(), status: 'deactivated' } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) throw new UnauthorizedException('Invalid email or password');
    user.status = 'active';
    await this.users.save(user);
    await this.audit(user.id, 'account.reactivated');
    return this.publicUser(user);
  }

  async requestPasswordReset(emailInput: string, clientOrigin?: string) {
    const email = emailInput.trim().toLowerCase();
    const user = await this.users.findOne({ where: { email, status: 'active' } });
    if (!user) return { accepted: true };
    const token = generateSecureToken();
    await this.resetTokens.save(this.resetTokens.create({ userId: user.id, tokenHash: token.hash, expiresAt: new Date(Date.now() + 60 * 60 * 1000), usedAt: null }));
    await this.mail.sendPasswordResetEmail(email, token.raw, user.fullName, clientOrigin);
    return { accepted: true, ...(this.config.get('NODE_ENV', 'development') === 'development' && { userId: user.id, resetToken: token.raw }) };
  }

  async requestEmailVerification(emailInput: string, clientOrigin?: string) {
    const user = await this.users.findOne({ where: { email: emailInput.trim().toLowerCase(), status: 'active' } });
    if (!user || user.emailVerifiedAt) return { accepted: true };
    const token = generateSecureToken();
    await this.verificationTokens.save(this.verificationTokens.create({ userId: user.id, email: user.email, tokenHash: token.hash, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), usedAt: null }));
    await this.mail.sendVerificationEmail(user.email, token.raw, user.fullName, clientOrigin);
    return { accepted: true, ...(this.config.get('NODE_ENV', 'development') === 'development' && { userId: user.id, verificationToken: token.raw }) };
  }

  async resetPassword(
    inputOrUserId: { userId?: string; email?: string; token: string; password?: string } | string,
    tokenParam?: string,
    passwordParam?: string,
  ) {
    let userId: string | undefined;
    let email: string | undefined;
    let token: string;
    let newPassword: string;

    if (typeof inputOrUserId === 'string') {
      userId = inputOrUserId;
      token = tokenParam || '';
      newPassword = passwordParam || '';
    } else {
      userId = inputOrUserId.userId;
      email = inputOrUserId.email?.trim().toLowerCase();
      token = inputOrUserId.token;
      newPassword = inputOrUserId.password || '';
    }

    if (!token || !newPassword) {
      throw new UnauthorizedException('Reset token and new password are required');
    }

    const result = await this.dataSource.transaction(async (manager) => {
      const reset = await manager.findOne(PasswordResetToken, { where: { tokenHash: hashToken(token), usedAt: IsNull() } });
      if (!reset || reset.expiresAt <= new Date()) throw new UnauthorizedException('Reset token is invalid or expired');

      if (userId && reset.userId !== userId) {
        throw new UnauthorizedException('Reset token does not match user');
      }

      const targetUserId = reset.userId;
      const user = await manager.findOne(User, { where: { id: targetUserId, status: 'active' } });
      if (!user) throw new UnauthorizedException('Account is unavailable');

      if (email && user.email.toLowerCase() !== email) {
        throw new UnauthorizedException('Reset token does not match email');
      }

      user.passwordHash = await hashPassword(newPassword);
      reset.usedAt = new Date();
      await manager.save(reset);
      await manager.save(user);
      await manager.update(AuthSession, { userId: user.id, status: 'active' }, { status: 'revoked', revokedAt: new Date() });
      return { success: true, message: 'Password has been reset successfully. Please sign in.' };
    });

    if (userId) {
      await this.audit(userId, 'password.reset');
    }
    return result;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.users.findOne({ where: { id: userId, status: 'active' } });
    if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) throw new UnauthorizedException('Current password is invalid');
    user.passwordHash = await hashPassword(newPassword);
    await this.users.save(user);
    await this.logoutAll(userId);
    await this.audit(userId, 'password.changed');
    return { success: true };
  }

  async getProfile(userId: string) {
    return this.publicUser(await this.users.findOneByOrFail({ id: userId }));
  }

  async updateProfile(userId: string, input: UpdateProfileDto) {
    const user = await this.users.findOneByOrFail({ id: userId });
    if (input.fullName !== undefined) user.fullName = input.fullName.trim();
    if (input.avatarUrl !== undefined) user.avatarUrl = input.avatarUrl ?? null;
    return this.publicUser(await this.users.save(user));
  }

  async verifyEmailWithToken(
    paramOrInput: { userId?: string; email?: string; token: string } | string,
    tokenParam?: string,
    meta?: RequestMeta,
  ) {
    let userId: string | undefined;
    let email: string | undefined;
    let token: string;

    if (typeof paramOrInput === 'string') {
      userId = paramOrInput;
      token = tokenParam || '';
    } else {
      userId = paramOrInput.userId;
      email = paramOrInput.email?.trim().toLowerCase();
      token = paramOrInput.token;
    }

    if (!token) {
      throw new UnauthorizedException('Verification token is required');
    }

    const tokenHash = hashToken(token);
    const verification = await this.verificationTokens.findOne({ where: { tokenHash, usedAt: IsNull() } });

    if (!verification) {
      if (email) {
        const alreadyVerifiedUser = await this.users.findOne({ where: { email, status: 'active' } });
        if (alreadyVerifiedUser && alreadyVerifiedUser.emailVerifiedAt) {
          const session = await this.createSession(alreadyVerifiedUser, meta ?? {});
          return {
            ...this.publicUser(alreadyVerifiedUser),
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            alreadyVerified: true,
            message: 'Email is already verified',
          };
        }
      }
      throw new UnauthorizedException('Verification token is invalid or has already been used');
    }

    if (verification.expiresAt <= new Date()) {
      throw new UnauthorizedException('Verification token has expired. Please request a new one.');
    }

    if (userId && verification.userId !== userId) {
      throw new UnauthorizedException('Verification token does not match user');
    }

    if (email && verification.email.toLowerCase() !== email) {
      throw new UnauthorizedException('Verification token does not match email');
    }

    const user = await this.users.findOneByOrFail({ id: verification.userId });
    user.emailVerifiedAt = new Date();
    verification.usedAt = new Date();
    await this.verificationTokens.save(verification);
    const savedUser = await this.users.save(user);
    await this.audit(savedUser.id, 'email.verified');

    const session = await this.createSession(savedUser, meta ?? {});
    return {
      ...this.publicUser(savedUser),
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      message: 'Email successfully verified',
    };
  }

  private async createSession(user: User, meta: RequestMeta) {
    const refreshTtl = this.config.get<string>('JWT_REFRESH_EXPIRATION', '7d');
    const session = await this.sessions.save(this.sessions.create({
      userId: user.id,
      refreshTokenHash: 'pending',
      status: 'active',
      ipAddress: meta.ip ?? null,
      userAgent: meta.userAgent ?? null,
      expiresAt: new Date(Date.now() + this.ttlMs(refreshTtl)),
      lastSeenAt: new Date(),
      revokedAt: null,
    }));
    const accessSecret = this.config.get<string>('JWT_ACCESS_SECRET') || this.config.get<string>('JWT_SECRET') || 'tm-prod-access-jwt-secret-key-2026-secure';
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET') || this.config.get<string>('JWT_SECRET') || 'tm-prod-refresh-jwt-secret-key-2026-secure';
    const accessToken = await this.jwt.signAsync({ sub: user.id, sid: session.id, type: 'access' }, { secret: accessSecret, expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRATION', '15m') as `${number}${'s' | 'm' | 'h' | 'd'}` });
    const refreshToken = await this.jwt.signAsync({ sub: user.id, sid: session.id, type: 'refresh' }, { secret: refreshSecret, expiresIn: refreshTtl as `${number}${'s' | 'm' | 'h' | 'd'}` });
    await this.sessions.update(session.id, { refreshTokenHash: hashToken(refreshToken) });
    await this.users.update(user.id, { lastLoginAt: new Date() });
    return { user: this.publicUser(user), accessToken, refreshToken };
  }

  private publicUser(user: User) {
    return { id: user.id, email: user.email, fullName: user.fullName, avatarUrl: user.avatarUrl, status: user.status, emailVerifiedAt: user.emailVerifiedAt, isSystemAdmin: user.isSystemAdmin ?? false };
  }

  private audit(userId: string, eventType: string) {
    return this.auditLogs.save(this.auditLogs.create({ userId, eventType, ipAddress: null, metadataJson: {} }));
  }

  private ttlMs(value: string) {
    const match = /^(\d+)([smhd])$/.exec(value);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 } as const;
    return Number(match[1]) * multipliers[match[2] as keyof typeof multipliers];
  }
}
