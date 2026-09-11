import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/identity/user.entity';
import { AuthSession } from '../../database/entities/identity/auth-session.entity';

export interface AccessTokenPayload { sub: string; type: 'access'; sid: string; }

interface CachedAuthUser {
  id: string;
  email: string;
  fullName: string;
  sessionId: string;
  isSystemAdmin: boolean;
  expiresAtTime: number;
  cachedAtTime: number;
}

const authCache = new Map<string, CachedAuthUser>();
const lastSeenTracker = new Map<string, number>();
const AUTH_CACHE_TTL_MS = 60 * 1000; // 60s fast memory cache
const LAST_SEEN_THROTTLE_MS = 5 * 60 * 1000; // 5 minutes write throttle

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(AuthSession) private readonly sessions: Repository<AuthSession>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET') || config.get<string>('JWT_SECRET') || 'tm-prod-access-jwt-secret-key-2026-secure',
    });
  }

  async validate(payload: AccessTokenPayload) {
    if (payload.type !== 'access') throw new UnauthorizedException('Invalid access token');
    const now = Date.now();
    const cacheKey = `${payload.sub}:${payload.sid}`;
    const cached = authCache.get(cacheKey);

    if (cached && cached.expiresAtTime > now && (now - cached.cachedAtTime) < AUTH_CACHE_TTL_MS) {
      this.triggerLastSeenUpdate(payload.sid, now);
      return {
        id: cached.id,
        email: cached.email,
        fullName: cached.fullName,
        sessionId: cached.sessionId,
        isSystemAdmin: cached.isSystemAdmin,
      };
    }

    const [user, session] = await Promise.all([
      this.users.findOne({ where: { id: payload.sub, status: 'active' } }),
      this.sessions.findOne({ where: { id: payload.sid, userId: payload.sub, status: 'active' } }),
    ]);

    if (!user) throw new UnauthorizedException('Account is unavailable');
    if (!session || session.expiresAt.getTime() <= now) throw new UnauthorizedException('Session is revoked or expired');

    const authUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      sessionId: payload.sid,
      isSystemAdmin: user.isSystemAdmin ?? false,
    };

    authCache.set(cacheKey, {
      ...authUser,
      expiresAtTime: session.expiresAt.getTime(),
      cachedAtTime: now,
    });

    this.triggerLastSeenUpdate(payload.sid, now);
    return authUser;
  }

  private triggerLastSeenUpdate(sessionId: string, now: number) {
    const lastTime = lastSeenTracker.get(sessionId) || 0;
    if (now - lastTime > LAST_SEEN_THROTTLE_MS) {
      lastSeenTracker.set(sessionId, now);
      this.sessions.update(sessionId, { lastSeenAt: new Date(now) }).catch(() => {});
    }
  }
}
