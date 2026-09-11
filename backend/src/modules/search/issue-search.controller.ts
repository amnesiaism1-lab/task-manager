import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { CurrentMember } from '../../common/decorators/current-member.decorator';
import { IssueSearchDto } from './dto/issue-search.dto';
import { IssueSearchService } from './issue-search.service';

@Controller('organizations/:orgId/issues')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class IssueSearchController {
  constructor(private readonly search: IssueSearchService) {}
  @Get('search') searchIssues(@Param('orgId') orgId: string, @CurrentMember('id') memberId: string, @Query() query: IssueSearchDto) { return this.search.search(orgId, memberId, query); }
}
