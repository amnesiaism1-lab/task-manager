import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentMember } from '../../common/decorators/current-member.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { DashboardService } from './dashboard.service';

@Controller('organizations/:orgId/dashboards')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class DashboardController {
  constructor(private readonly dashboards: DashboardService) {}
  @Get() list(@Param('orgId') orgId: string, @CurrentMember('id') memberId: string) { return this.dashboards.list(orgId, memberId); }
  @Post() create(@Param('orgId') orgId: string, @CurrentMember('id') memberId: string, @Body() body: { name: string; description?: string }) { return this.dashboards.create(orgId, memberId, body); }
  @Get(':dashboardId/widgets') widgets(@Param('orgId') orgId: string, @Param('dashboardId') id: string, @CurrentMember('id') memberId: string) { return this.dashboards.getWidgets(orgId, memberId, id); }
  @Post(':dashboardId/widgets') addWidget(@Param('orgId') orgId: string, @Param('dashboardId') id: string, @CurrentMember('id') memberId: string, @Body() body: { widgetType: string; savedFilterId?: string; configJson?: Record<string, unknown>; position?: number }) { return this.dashboards.addWidget(orgId, memberId, id, body); }
  @Post(':dashboardId/shares') share(@Param('orgId') orgId: string, @Param('dashboardId') id: string, @CurrentMember('id') memberId: string, @Body() body: { granteeType: string; orgMemberId?: string; projectId?: string; canEdit?: boolean }) { return this.dashboards.share(orgId, memberId, id, body); }
}