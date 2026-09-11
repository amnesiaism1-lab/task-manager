import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentMember } from '../../common/decorators/current-member.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { WebhookService } from './webhook.service';

@Controller('organizations/:orgId/webhooks')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class WebhookController {
  constructor(private readonly webhooks: WebhookService) {}
  @Get() list(@Param('orgId') orgId: string, @CurrentMember('id') memberId: string) { return this.webhooks.list(orgId, memberId); }
  @Post() create(@Param('orgId') orgId: string, @CurrentMember('id') memberId: string, @Body() body: { url: string; events: string[]; projectId?: string }) { return this.webhooks.create(orgId, memberId, body); }
  @Patch(':webhookId/pause') pause(@Param('orgId') orgId: string, @Param('webhookId') id: string, @CurrentMember('id') memberId: string) { return this.webhooks.pause(orgId, memberId, id); }
  @Delete(':webhookId') remove(@Param('orgId') orgId: string, @Param('webhookId') id: string, @CurrentMember('id') memberId: string) { return this.webhooks.remove(orgId, memberId, id); }
}