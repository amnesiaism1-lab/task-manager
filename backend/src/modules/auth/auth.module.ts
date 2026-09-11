import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entities/identity/user.entity';
import { AuthSession } from '../../database/entities/identity/auth-session.entity';
import { EmailVerificationToken } from '../../database/entities/identity/email-verification-token.entity';
import { PasswordResetToken } from '../../database/entities/identity/password-reset-token.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { ApiToken } from '../../database/entities/identity/api-token.entity';
import { ApiTokenController } from './api-token.controller';
import { ApiTokenService } from './api-token.service';
import { AuthAuditLog } from '../../database/entities/identity/auth-audit-log.entity';
import { MailModule } from '../mail/mail.module';
import { OrganizationMember } from '../../database/entities/identity/organization-member.entity';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';

@Module({
	imports: [TypeOrmModule.forFeature([User, AuthSession, EmailVerificationToken, PasswordResetToken, ApiToken, AuthAuditLog, OrganizationMember]), MailModule, JwtModule.register({}), PassportModule.register({ defaultStrategy: 'jwt' })],
	controllers: [AuthController, ApiTokenController],
	providers: [AuthService, JwtStrategy, ApiTokenService, OrgMembershipGuard],
	exports: [AuthService, PassportModule, ApiTokenService],
})
export class AuthModule {}
