import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentMember } from '../../common/decorators/current-member.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { JobService } from './job.service';

@Controller('organizations/:orgId/jobs')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class JobController {
  constructor(private readonly jobs: JobService) {}
  @Get() list(@Param('orgId') orgId: string, @CurrentMember('id') memberId: string) { return this.jobs.list(orgId, memberId); }
  @Post() create(@Param('orgId') orgId: string, @CurrentMember('id') memberId: string, @Body() body: { jobType: 'reconciliation' | 'import' | 'export'; idempotencyKey: string; input?: Record<string, unknown> }) { return this.jobs.create(orgId, memberId, body); }
  @Get(':jobId') get(@Param('orgId') orgId: string, @Param('jobId') jobId: string, @CurrentMember('id') memberId: string) { return this.jobs.get(orgId, memberId, jobId); }
  @Delete(':jobId') cancel(@Param('orgId') orgId: string, @Param('jobId') jobId: string, @CurrentMember('id') memberId: string) { return this.jobs.cancel(orgId, memberId, jobId); }
}