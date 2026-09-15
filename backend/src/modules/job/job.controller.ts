import { Body, Controller, Delete, ForbiddenException, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentMember } from '../../common/decorators/current-member.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { JobService } from './job.service';
import { PermissionResolverService } from '../permission/permission-resolver.service';

@Controller('organizations/:orgId/jobs')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class JobController {
  constructor(
    private readonly jobs: JobService,
    private readonly permissions: PermissionResolverService,
  ) {}

  @Get() list(@Param('orgId') orgId: string, @CurrentMember('id') memberId: string) { return this.jobs.list(orgId, memberId); }

  @Post()
  async create(
    @Param('orgId') orgId: string,
    @CurrentMember('id') memberId: string,
    @Body() body: { jobType: 'reconciliation' | 'import' | 'export'; idempotencyKey: string; input?: Record<string, unknown> }
  ) {
    if (body.jobType === 'reconciliation') {
      const allowed = (await this.permissions.hasOrgPermissions(memberId, ['MANAGE_JOBS'])) ||
                      (await this.permissions.hasOrgPermissions(memberId, ['MANAGE_ORGANIZATION']));
      if (!allowed) {
        throw new ForbiddenException('Only administrators with MANAGE_JOBS permission can initiate reconciliation jobs.');
      }
    }
    return this.jobs.create(orgId, memberId, body);
  }

  @Get(':jobId') get(@Param('orgId') orgId: string, @Param('jobId') jobId: string, @CurrentMember('id') memberId: string) { return this.jobs.get(orgId, memberId, jobId); }
  @Delete(':jobId') cancel(@Param('orgId') orgId: string, @Param('jobId') jobId: string, @CurrentMember('id') memberId: string) { return this.jobs.cancel(orgId, memberId, jobId); }
}