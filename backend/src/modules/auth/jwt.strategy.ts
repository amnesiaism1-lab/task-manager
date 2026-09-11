import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/identity/user.entity';
import { AuthSession } from '../../database/entities/identity/auth-session.entity';

export interface AccessTokenPayload { sub: string; type: 'access'; sid: string; }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(AuthSession) private readonly sessions: Repository<AuthSession>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: AccessTokenPayload) {
    if (payload.type !== 'access') throw new UnauthorizedException('Invalid access token');
    const user = await this.users.findOne({ where: { id: payload.sub, status: 'active' } });
    if (!user) throw new UnauthorizedException('Account is unavailable');
    const session = await this.sessions.findOne({ where: { id: payload.sid, userId: user.id, status: 'active' } });
    if (!session || session.expiresAt <= new Date()) throw new UnauthorizedException('Session is revoked or expired');
    await this.sessions.update(session.id, { lastSeenAt: new Date() });
    return { id: user.id, email: user.email, fullName: user.fullName, sessionId: payload.sid, isSystemAdmin: user.isSystemAdmin ?? false };
  }
}
