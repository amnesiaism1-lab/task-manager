import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { Issue } from '../../database/entities/issue/issue.entity';
import { Comment } from '../../database/entities/issue/comment.entity';
import { WorkLog } from '../../database/entities/issue/work-log.entity';
import { ProjectMember } from '../../database/entities/project/project-member.entity';
import { Label } from '../../database/entities/issue/label.entity';
import { IssueLabel } from '../../database/entities/issue/issue-label.entity';
import { IssueWatcher } from '../../database/entities/issue/issue-watcher.entity';
import { IssueLinkType } from '../../database/entities/issue/issue-link-type.entity';
import { IssueLink } from '../../database/entities/issue/issue-link.entity';
import { WorkflowState } from '../../database/entities/workflow/workflow-state.entity';
import { WorkflowTransition } from '../../database/entities/workflow/workflow-transition.entity';
import { IssueStateHistory } from '../../database/entities/issue/issue-state-history.entity';
import { IssueType } from '../../database/entities/issue/issue-type.entity';
import { AddLabelDto, AddWatcherDto, CreateCommentDto, CreateIssueLinkDto, CreateWorkLogDto } from './dto/issue.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/pagination.util';

@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Issue) private readonly issues: Repository<Issue>,
    @InjectRepository(Comment) private readonly comments: Repository<Comment>,
    @InjectRepository(WorkLog) private readonly workLogs: Repository<WorkLog>,
    @InjectRepository(ProjectMember) private readonly projectMembers: Repository<ProjectMember>,
    @InjectRepository(Label) private readonly labels: Repository<Label>,
    @InjectRepository(IssueLabel) private readonly issueLabels: Repository<IssueLabel>,
    @InjectRepository(IssueWatcher) private readonly watchers: Repository<IssueWatcher>,
    @InjectRepository(IssueLinkType) private readonly linkTypes: Repository<IssueLinkType>,
    @InjectRepository(IssueLink) private readonly links: Repository<IssueLink>,
    @InjectRepository(WorkflowState) private readonly states: Repository<WorkflowState>,
    @InjectRepository(WorkflowTransition) private readonly transitions: Repository<WorkflowTransition>,
    @InjectRepository(IssueStateHistory) private readonly history: Repository<IssueStateHistory>,
    @InjectRepository(IssueType) private readonly issueTypes: Repository<IssueType>,
    private readonly dataSource: DataSource,
  ) {}

  private stateCache = new Map<string, { val: WorkflowState; exp: number }>();
  private typeCache = new Map<string, { val: IssueType; exp: number }>();
  private transCache = new Map<string, { val: WorkflowTransition[]; exp: number }>();

  private async getCachedState(id: string): Promise<WorkflowState | null> {
    const cached = this.stateCache.get(id);
    if (cached && cached.exp > Date.now()) return cached.val;
    const item = await this.states.findOne({ where: { id } });
    if (item) this.stateCache.set(id, { val: item, exp: Date.now() + 300_000 });
    return item;
  }

  private async getCachedType(id: string): Promise<IssueType | null> {
    const cached = this.typeCache.get(id);
    if (cached && cached.exp > Date.now()) return cached.val;
    const item = await this.issueTypes.findOne({ where: { id } });
    if (item) this.typeCache.set(id, { val: item, exp: Date.now() + 300_000 });
    return item;
  }

  private async getCachedTransitions(workflowId: string, fromStateId: string): Promise<WorkflowTransition[]> {
    const key = `${workflowId}:${fromStateId}`;
    const cached = this.transCache.get(key);
    if (cached && cached.exp > Date.now()) return cached.val;
    const items = await this.transitions.find({ where: { workflowId, fromStateId }, order: { sortOrder: 'ASC' } });
    this.transCache.set(key, { val: items, exp: Date.now() + 300_000 });
    return items;
  }

  private async accessibleIssue(orgId: string, issueId: string, memberId: string) {
    const issue = await this.issues.findOne({ where: { id: issueId, orgId, deletedAt: IsNull() } });
    if (!issue) throw new NotFoundException('Issue not found');
    const membership = await this.projectMembers.findOne({ where: { projectId: issue.projectId, orgMemberId: memberId, status: 'active' } });
    if (!membership) throw new ForbiddenException('Project membership required');
    return issue;
  }

  async getDetail(orgId: string, issueId: string, memberId: string, preloadedIssue?: Issue) {
    const issue = preloadedIssue || (await this.accessibleIssue(orgId, issueId, memberId));
    const [state, issueType, labels, watchers, links, transitions, history] = await Promise.all([
      this.getCachedState(issue.stateId),
      this.getCachedType(issue.issueTypeId),
      this.issueLabels.createQueryBuilder('il').innerJoin(Label, 'label', 'label.id = il.label_id').where('il.issue_id = :issueId', { issueId: issue.id }).select('label.id', 'id').addSelect('label.name', 'name').getRawMany(),
      this.watchers.find({ where: { issueId: issue.id } }),
      this.links.find({ where: [{ issueId: issue.id }, { linkedIssueId: issue.id }] }),
      this.getCachedTransitions(issue.workflowId, issue.stateId),
      this.history.find({ where: { issueId: issue.id }, order: { occurredAt: 'DESC' }, take: 50 }),
    ]);
    return { ...issue, state, issueType, labels, watchers, links, transitions, history };
  }

  listLabels(orgId: string, issueId: string, memberId: string) {
    return this.getDetail(orgId, issueId, memberId).then((issue) => issue.labels);
  }

  listWatchers(orgId: string, issueId: string, memberId: string) {
    return this.accessibleIssue(orgId, issueId, memberId).then(() => this.watchers.find({ where: { issueId } }));
  }

  listLinks(orgId: string, issueId: string, memberId: string) {
    return this.accessibleIssue(orgId, issueId, memberId).then(() => this.links.find({ where: [{ issueId }, { linkedIssueId: issueId }] }));
  }

  listHistory(orgId: string, issueId: string, memberId: string) {
    return this.accessibleIssue(orgId, issueId, memberId).then(() => this.history.find({ where: { issueId }, order: { occurredAt: 'DESC' }, take: 50 }));
  }

  listTransitions(orgId: string, issueId: string, memberId: string) {
    return this.accessibleIssue(orgId, issueId, memberId).then((issue) => this.getCachedTransitions(issue.workflowId, issue.stateId));
  }

  async addComment(orgId: string, issueId: string, memberId: string, input: CreateCommentDto) {
    const issue = await this.accessibleIssue(orgId, issueId, memberId);
    if (input.parentCommentId) {
      const parent = await this.comments.findOne({ where: { id: input.parentCommentId, issueId, deletedAt: IsNull() } });
      if (!parent) throw new ConflictException('Comment parent must belong to this issue');
    }
    return this.comments.save(this.comments.create({ orgId, issueId: issue.id, authorMemberId: memberId, parentCommentId: input.parentCommentId ?? null, body: input.body.trim(), bodyFormat: 'plain', deletedAt: null }));
  }

  listComments(orgId: string, issueId: string, memberId: string, pagination: PaginationDto) { return this.accessibleIssue(orgId, issueId, memberId).then(() => paginate(this.comments.createQueryBuilder('comment').where('comment.org_id = :orgId AND comment.issue_id = :issueId AND comment.deleted_at IS NULL', { orgId, issueId }).orderBy('comment.created_at', 'ASC'), pagination)); }

  async deleteComment(orgId: string, issueId: string, commentId: string, memberId: string) {
    await this.accessibleIssue(orgId, issueId, memberId);
    const comment = await this.comments.findOne({ where: { id: commentId, orgId, issueId, authorMemberId: memberId, deletedAt: IsNull() } });
    if (!comment) throw new NotFoundException('Comment not found');
    comment.deletedAt = new Date();
    return this.comments.save(comment);
  }

  async addWorkLog(orgId: string, issueId: string, memberId: string, input: CreateWorkLogDto) {
    await this.accessibleIssue(orgId, issueId, memberId);
    return this.dataSource.transaction(async (manager) => {
      const issue = await manager.findOne(Issue, { where: { id: issueId, orgId, deletedAt: IsNull() }, lock: { mode: 'pessimistic_write' } });
      if (!issue) throw new NotFoundException('Issue not found');
      const workLog = await manager.save(WorkLog, manager.create(WorkLog, { issueId: issue.id, authorMemberId: memberId, timeSpentSeconds: input.timeSpentSeconds, startedAt: new Date(input.startedAt), comment: input.comment?.trim() || null, deletedAt: null }));
      issue.timeSpentSeconds += input.timeSpentSeconds;
      await manager.save(issue);
      return workLog;
    });
  }

  listWorkLogs(orgId: string, issueId: string, memberId: string, pagination: PaginationDto) { return this.accessibleIssue(orgId, issueId, memberId).then((issue) => paginate(this.workLogs.createQueryBuilder('log').innerJoin(Issue, 'issue', 'issue.id = log.issue_id').where('issue.id = :issueId AND issue.org_id = :orgId', { issueId: issue.id, orgId }).andWhere('log.deleted_at IS NULL').orderBy('log.started_at', 'DESC'), pagination)); }

  async addLabel(orgId: string, issueId: string, memberId: string, input: AddLabelDto) {
    const issue = await this.accessibleIssue(orgId, issueId, memberId);
    const name = input.name.trim().toLowerCase();
    if (!name) throw new BadRequestException('Label name cannot be blank');
    let label = await this.labels.findOne({ where: { orgId, name, archivedAt: IsNull() } });
    if (!label) label = await this.labels.save(this.labels.create({ orgId, name, archivedAt: null }));
    if (await this.issueLabels.exists({ where: { issueId: issue.id, labelId: label.id } })) throw new ConflictException('Label is already attached to this issue');
    return this.issueLabels.save(this.issueLabels.create({ issueId: issue.id, labelId: label.id, addedByMemberId: memberId }));
  }

  async addWatcher(orgId: string, issueId: string, memberId: string, input: AddWatcherDto) {
    const issue = await this.accessibleIssue(orgId, issueId, memberId);
    const watcher = await this.projectMembers.findOne({ where: { projectId: issue.projectId, orgMemberId: input.memberId, status: 'active' } });
    if (!watcher) throw new ForbiddenException('Watcher must be an active project member');
    if (await this.watchers.exists({ where: { issueId, orgMemberId: input.memberId } })) throw new ConflictException('Member is already watching this issue');
    return this.watchers.save(this.watchers.create({ issueId, orgMemberId: input.memberId }));
  }

  async linkIssue(orgId: string, issueId: string, memberId: string, input: CreateIssueLinkDto) {
    const issue = await this.accessibleIssue(orgId, issueId, memberId);
    const linked = await this.accessibleIssue(orgId, input.linkedIssueId, memberId);
    if (issue.id === linked.id) throw new ConflictException('Issue cannot link to itself');
    const type = await this.linkTypes.findOne({ where: { id: input.linkTypeId, orgId, archivedAt: IsNull() } });
    if (!type) throw new NotFoundException('Link type not found');
    const [source, target] = type.directionality === 'symmetric' && issue.id > linked.id ? [linked, issue] : [issue, linked];
    if (await this.links.exists({ where: { orgId, issueId: source.id, linkedIssueId: target.id, linkTypeId: type.id } })) throw new ConflictException('Issue link already exists');
    return this.links.save(this.links.create({ orgId, issueId: source.id, linkedIssueId: target.id, linkTypeId: type.id, createdByMemberId: memberId }));
  }

  async update(orgId: string, issueId: string, memberId: string, input: any) {
    await this.accessibleIssue(orgId, issueId, memberId);
    return this.dataSource.transaction(async (manager) => {
      const locked = await manager.findOne(Issue, { where: { id: issueId, orgId, deletedAt: IsNull() }, lock: { mode: 'pessimistic_write' } });
      if (!locked) throw new NotFoundException('Issue not found');
      const expectedVersion = input.expectedVersion ?? input.version;
      if (expectedVersion !== undefined && Number(expectedVersion) !== locked.version) {
        throw new ConflictException('Issue version is stale');
      }
      if (input.summary !== undefined) locked.summary = input.summary.trim();
      if (input.description !== undefined) locked.description = input.description?.trim() || null;
      if (input.priority !== undefined) locked.priority = input.priority;
      if (input.assigneeMemberId !== undefined) locked.assigneeMemberId = input.assigneeMemberId || null;
      if (input.sprintId !== undefined) locked.sprintId = input.sprintId || null;
      if (input.dueAt !== undefined) locked.dueAt = input.dueAt ? new Date(input.dueAt) : null;
      if (input.originalEstimateSeconds !== undefined) locked.originalEstimateSeconds = input.originalEstimateSeconds;
      if (input.remainingEstimateSeconds !== undefined) locked.remainingEstimateSeconds = input.remainingEstimateSeconds;
      locked.version += 1;
      return manager.save(locked);
    });
  }

  async delete(orgId: string, issueId: string, memberId: string) {
    const issue = await this.accessibleIssue(orgId, issueId, memberId);
    return this.dataSource.transaction(async (manager) => {
      const locked = await manager.findOne(Issue, { where: { id: issueId, orgId, deletedAt: IsNull() }, lock: { mode: 'pessimistic_write' } });
      if (!locked) throw new NotFoundException('Issue not found');
      locked.deletedAt = new Date();
      locked.version += 1;
      await manager.save(locked);
      return { success: true, id: issue.id, key: issue.key, deletedAt: locked.deletedAt };
    });
  }

  async transition(orgId: string, issueId: string, memberId: string, input: any) {
    const issue = await this.accessibleIssue(orgId, issueId, memberId);
    const transitionKey = input.transitionKey;
    const transition = await this.transitions.findOne({ where: { workflowId: issue.workflowId, key: transitionKey, fromStateId: issue.stateId } });
    if (!transition) throw new NotFoundException('Transition not found');
    const target = await this.states.findOne({ where: { id: transition.toStateId } });
    if (!target) throw new NotFoundException('Target state not found');

    return this.dataSource.transaction(async (manager) => {
      const locked = await manager.findOne(Issue, { where: { id: issueId, orgId, deletedAt: IsNull() }, lock: { mode: 'pessimistic_write' } });
      if (!locked) throw new NotFoundException('Issue not found');
      locked.stateId = target.id;
      locked.version += 1;
      locked.resolvedAt = target.isTerminal ? new Date() : null;
      await manager.save(locked);
      await manager.save(IssueStateHistory, manager.create(IssueStateHistory, {
        orgId,
        issueId,
        fromStateId: transition.fromStateId,
        toStateId: transition.toStateId,
        transitionId: transition.id,
        actorMemberId: memberId,
        comment: input.comment || null,
        idempotencyKey: input.idempotencyKey || null,
        versionBefore: locked.version - 1,
        versionAfter: locked.version,
      }));
      return locked;
    });
  }
}
