import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentMember } from '../../common/decorators/current-member.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { SavedFilterService } from './saved-filter.service';

@Controller('organizations/:orgId/filters')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class SavedFilterController {
  constructor(private readonly filters: SavedFilterService) {}
  @Get() list(@Param('orgId') orgId: string, @CurrentMember('id') memberId: string) { return this.filters.list(orgId, memberId); }
  @Post() create(@Param('orgId') orgId: string, @CurrentMember('id') memberId: string, @Body() body: { name: string; description?: string; queryText: string }) { return this.filters.create(orgId, memberId, body); }
  @Get(':filterId') get(@Param('orgId') orgId: string, @Param('filterId') filterId: string, @CurrentMember('id') memberId: string) { return this.filters.get(orgId, filterId, memberId); }
  @Post(':filterId/shares') share(@Param('orgId') orgId: string, @Param('filterId') filterId: string, @CurrentMember('id') memberId: string, @Body() body: { granteeType: string; orgMemberId?: string; projectId?: string; groupId?: string; projectRoleKey?: string; canEdit?: boolean }) { return this.filters.share(orgId, filterId, memberId, body); }
  @Post(':filterId/subscriptions') subscribe(@Param('orgId') orgId: string, @Param('filterId') filterId: string, @CurrentMember('id') memberId: string, @Body() body: { cronExpression: string; timezone?: string }) { return this.filters.subscribe(orgId, filterId, memberId, body); }
}