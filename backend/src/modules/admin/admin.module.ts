import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entities/identity/user.entity';
import { AuthSession } from '../../database/entities/identity/auth-session.entity';
import { Organization } from '../../database/entities/identity/organization.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SystemAdminGuard } from '../../common/guards/system-admin.guard';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';

/**
 * AdminModule — Platform administration module.
 * Provides UC-SYS-01 (Global User Management) and UC-SYS-02 (Global Org Management).
 * Access restricted to users with users.is_system_admin = true via SystemAdminGuard.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User, AuthSession, Organization]),
    AuthModule,
    MailModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, SystemAdminGuard],
})
export class AdminModule {}
