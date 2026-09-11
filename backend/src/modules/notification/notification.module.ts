import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../../database/entities/audit/notification.entity';
import { NotificationPreference } from '../../database/entities/audit/notification-preference.entity';
import { OrganizationMember } from '../../database/entities/identity/organization-member.entity';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { OutboxModule } from '../outbox/outbox.module';
import { NotificationController } from './notification.controller';
import { AuthModule } from '../auth/auth.module';
import { NotificationPreferenceService } from './notification.service';

@Module({
	imports: [TypeOrmModule.forFeature([Notification, NotificationPreference, OrganizationMember]), OutboxModule, AuthModule],
	controllers: [NotificationController],
	providers: [OrgMembershipGuard, NotificationPreferenceService],
})
export class NotificationModule {}
