import { Body, Controller, Get, Param, Patch, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { CurrentMember } from '../../common/decorators/current-member.decorator';
import { OutboxService } from '../outbox/outbox.service';
import { NotificationPreferenceService } from './notification.service';

@Controller('organizations/:orgId/notifications')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class NotificationController {
  constructor(private readonly outbox: OutboxService, private readonly preferences: NotificationPreferenceService) {}
  @Get() list(@Param('orgId') orgId: string, @CurrentMember('id') memberId: string) { return this.outbox.list(orgId, memberId); }
  @Patch(':notificationId/read') markRead(@Param('orgId') orgId: string, @Param('notificationId') notificationId: string, @CurrentMember('id') memberId: string) { return this.outbox.markRead(orgId, memberId, notificationId); }
  @Get('preferences') listPreferences(@Param('orgId') orgId: string, @CurrentMember('id') memberId: string) { return this.preferences.list(orgId, memberId); }
  @Put('preferences') setPreference(@Param('orgId') orgId: string, @CurrentMember('id') memberId: string, @Body() body: { notificationType: string; channel: 'in_app' | 'email'; enabled: boolean }) { return this.preferences.upsert(orgId, memberId, body); }
}
