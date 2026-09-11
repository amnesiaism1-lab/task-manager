import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { Issue } from '../../database/entities/issue/issue.entity';
import { ProjectMember } from '../../database/entities/project/project-member.entity';
import { WorkflowState } from '../../database/entities/workflow/workflow-state.entity';
import { paginate } from '../../common/utils/pagination.util';
import { IssueSearchDto } from './dto/issue-search.dto';
import { applyQueryAst } from './query-ast';

@Injectable()
export class IssueSearchService {
  constructor(
    @InjectRepository(Issue) private readonly issues: Repository<Issue>,
    @InjectRepository(ProjectMember) private readonly members: Repository<ProjectMember>,
    @InjectRepository(WorkflowState) private readonly states: Repository<WorkflowState>,
  ) {}

  async search(orgId: string, memberId: string, input: IssueSearchDto) {
    const userMemberships = await this.members.find({
      where: { orgMemberId: memberId, status: 'active' },
      select: { projectId: true },
    });
    const allowedProjectIds = userMemberships.map((m) => m.projectId);
    if (allowedProjectIds.length === 0) {
      return paginate(this.issues.createQueryBuilder('issue').where('1 = 0'), input);
    }

    const targetProjectIds = input.projectId
      ? (allowedProjectIds.includes(input.projectId) ? [input.projectId] : [])
      : allowedProjectIds;

    if (targetProjectIds.length === 0) {
      return paginate(this.issues.createQueryBuilder('issue').where('1 = 0'), input);
    }

    const query = this.issues.createQueryBuilder('issue')
      .where('issue.org_id = :orgId AND issue.deleted_at IS NULL', { orgId })
      .andWhere('issue.project_id IN (:...targetProjectIds)', { targetProjectIds });

    if (input.q) {
      query.andWhere(
        new Brackets((where) =>
          where.where('issue.summary ILIKE :q', { q: `%${input.q}%` })
            .orWhere('issue.key ILIKE :q', { q: `%${input.q}%` })
        )
      );
    }
    if (input.status) {
      query.andWhere('issue.state_id = :status', { status: input.status });
    }
    if (input.assigneeMemberId) {
      query.andWhere('issue.assignee_member_id = :assigneeMemberId', { assigneeMemberId: input.assigneeMemberId });
    }
    if (input.issueTypeKey) {
      query.innerJoin(
        'issue_types',
        'issueType',
        'issueType.id = issue.issue_type_id AND issueType.key = :issueTypeKey',
        { issueTypeKey: input.issueTypeKey }
      );
    }

    applyQueryAst(query, input.queryAst);

    const sortMap: Record<string, string> = {
      createdAt: 'issue.created_at',
      updatedAt: 'issue.updated_at',
      key: 'issue.key',
      summary: 'issue.summary',
    };
    query.orderBy(sortMap[input.sortBy ?? 'updatedAt'] ?? 'issue.updated_at', input.sortOrder);

    const result = await paginate(query, input);
    const stateIds = [...new Set(result.data.map((issue) => issue.stateId))];
    const states = stateIds.length ? await this.states.find({ where: { id: In(stateIds) } }) : [];
    const stateById = Object.fromEntries(states.map((state) => [state.id, state]));
    result.data = result.data.map((issue) => ({ ...issue, state: stateById[issue.stateId] ?? null }));
    return result;
  }
}
