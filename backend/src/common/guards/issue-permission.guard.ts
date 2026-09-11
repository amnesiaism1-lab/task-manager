import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { Issue } from '../../database/entities/issue/issue.entity';
import { PermissionResolverService } from '../../modules/permission/permission-resolver.service.js';
import { IssueAccessService } from '../../modules/issue/issue-access.service.js';

/**
 * Authorizes routes addressed by an issue id.  ProjectPermissionGuard cannot
 * be used on these routes because the project id is deliberately not part of
 * the public URL.  Besides the project permission it enforces an issue's
 * optional security level, preventing a project member from bypassing it via
 * comments, work logs, history, or attachments.
 */
@Injectable()
export class IssuePermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(Issue) private readonly issues: Repository<Issue>,
    private readonly permissions: PermissionResolverService,
    private readonly issueAccess: IssueAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const orgId = request.params?.orgId;
    const issueId = request.params?.issueId;
    const member = request.orgMember;
    if (!orgId || !issueId || !member) throw new ForbiddenException('Issue context required');
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(issueId)) throw new NotFoundException('Issue not found');

    const issue = await this.issues.findOne({ where: { id: issueId, orgId, deletedAt: IsNull() } });
    if (!issue) throw new NotFoundException('Issue not found');

    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]) ?? [];
    if (!(await this.permissions.hasProjectPermissions(member.id, issue.projectId, required))) {
      throw new ForbiddenException('Insufficient project permissions');
    }
    const canAccess = await this.issueAccess.canAccess(issue, member.id);
    if (!canAccess) throw new ForbiddenException('Issue security level denied');
    request.issue = issue;
    return true;
  }
}
