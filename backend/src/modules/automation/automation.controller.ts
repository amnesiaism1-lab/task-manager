import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentMember } from '../../common/decorators/current-member.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { OrgPermissionGuard } from '../../common/guards/org-permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { AutomationService } from './automation.service';

@Controller('organizations/:orgId/automation-rules')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class AutomationController {
  constructor(private readonly automation: AutomationService) {}
  @Get() list(@Param('orgId') orgId: string, @CurrentMember('id') memberId: string) { return this.automation.list(orgId, memberId); }
  @Post() @UseGuards(OrgPermissionGuard) @RequirePermissions('MANAGE_AUTOMATION') create(@Param('orgId') orgId: string, @CurrentMember('id') memberId: string, @Body() body: Parameters<AutomationService['create']>[2]) { return this.automation.create(orgId, memberId, body); }
  @Post(':ruleId/activate') @UseGuards(OrgPermissionGuard) @RequirePermissions('MANAGE_AUTOMATION') activate(@Param('orgId') orgId: string, @Param('ruleId') id: string, @CurrentMember('id') memberId: string) { return this.automation.activate(orgId, memberId, id); }
  @Post(':ruleId/execute') @UseGuards(OrgPermissionGuard) @RequirePermissions('MANAGE_AUTOMATION') execute(@Param('orgId') orgId: string, @Param('ruleId') id: string, @CurrentMember('id') memberId: string, @Body() body: { idempotencyKey: string }) { return this.automation.execute(orgId, memberId, id, body.idempotencyKey); }
}
