import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CurrentMember } from '../../common/decorators/current-member.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AuditService } from './audit.service';

@Controller('organizations/:orgId/audit')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class AuditController {
  constructor(private readonly audit: AuditService) {}
  @Get() search(@Param('orgId') orgId: string, @CurrentMember('id') _memberId: string, @Query() query: PaginationDto & { projectId?: string; issueId?: string; eventType?: string; actorMemberId?: string }) { return this.audit.search(orgId, query); }
}