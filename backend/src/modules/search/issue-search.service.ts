import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, IsNull, Repository } from 'typeorm';
import { Issue } from '../../database/entities/issue/issue.entity';
import { ProjectMember } from '../../database/entities/project/project-member.entity';
import { WorkflowState } from '../../database/entities/workflow/workflow-state.entity';
import { paginate } from '../../common/utils/pagination.util';
import { IssueSearchDto } from './dto/issue-search.dto';
import { IssueAccessService } from '../issue/issue-access.service';
import { applyQueryAst } from './query-ast';
import { PermissionResolverService } from '../permission/permission-resolver.service';

@Injectable()
export class IssueSearchService {
  constructor(
    @InjectRepository(Issue) private readonly issues: Repository<Issue>,
    @InjectRepository(ProjectMember) private readonly members: Repository<ProjectMember>,
    @InjectRepository(WorkflowState) private readonly states: Repository<WorkflowState>,
    private readonly issueAccess: IssueAccessService,
    private readonly permissions: PermissionResolverService,
  ) {}

  async search(orgId: string, memberId: string, input: IssueSearchDto) {
    const query = this.issues.createQueryBuilder('issue')
      .innerJoin(ProjectMember, 'membership', 'membership.project_id = issue.project_id AND membership.org_member_id = :memberId AND membership.status = :membershipStatus', { memberId, membershipStatus: 'active' })
      .where('issue.org_id = :orgId AND issue.deleted_at IS NULL', { orgId });
    if (input.projectId) query.andWhere('issue.project_id = :projectId', { projectId: input.projectId });
    const candidateIssues = await this.issues.find({ where: { orgId, deletedAt: IsNull() } });
    const visibleIds = (await Promise.all(candidateIssues.map(async (candidate) => {
      if (!(await this.permissions.hasProjectPermissions(memberId, candidate.projectId, ['BROWSE_PROJECT']))) return null;
      return (await this.issueAccess.canAccess(candidate, memberId)) ? candidate.id : null;
    }))).filter((id): id is string => Boolean(id));
    if (visibleIds.length === 0) {
      const empty = await paginate(query.andWhere('1 = 0'), input);
      return empty;
    }
    query.andWhere('issue.id IN (:...visibleIds)', { visibleIds });
    if (input.q) query.andWhere(new Brackets((where) => where.where('issue.summary ILIKE :q', { q: `%${input.q}%` }).orWhere('issue.key ILIKE :q', { q: `%${input.q}%` })));
    if (input.status) query.andWhere('issue.state_id = :status', { status: input.status });
    if (input.assigneeMemberId) query.andWhere('issue.assignee_member_id = :assigneeMemberId', { assigneeMemberId: input.assigneeMemberId });
    if (input.issueTypeKey) query.innerJoin('issue_types', 'issueType', 'issueType.id = issue.issue_type_id AND issueType.key = :issueTypeKey', { issueTypeKey: input.issueTypeKey });
    applyQueryAst(query, input.queryAst);
    const sortMap: Record<string, string> = { createdAt: 'issue.created_at', updatedAt: 'issue.updated_at', key: 'issue.key', summary: 'issue.summary' };
    query.orderBy(sortMap[input.sortBy ?? 'updatedAt'] ?? 'issue.updated_at', input.sortOrder);
    const result = await paginate(query, input);
    const stateIds = [...new Set(result.data.map((issue) => issue.stateId))];
    const states = stateIds.length ? await this.states.find({ where: { id: In(stateIds) } }) : [];
    const stateById = Object.fromEntries(states.map((state) => [state.id, state]));
    result.data = result.data.map((issue) => ({ ...issue, state: stateById[issue.stateId] ?? null }));
    return result;
  }
}
