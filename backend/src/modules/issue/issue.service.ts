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
import { ProjectComponent } from '../../database/entities/project/project-component.entity';
import { ProjectVersion } from '../../database/entities/project/project-version.entity';
import { CustomFieldContext } from '../../database/entities/custom-field/custom-field-context.entity';
import { CustomField } from '../../database/entities/custom-field/custom-field.entity';
import { CustomFieldOption } from '../../database/entities/custom-field/custom-field-option.entity';
import { IssueCustomFieldValue } from '../../database/entities/custom-field/issue-custom-field-value.entity';
import { ActivityLog } from '../../database/entities/audit/activity-log.entity';
import { OutboxEvent } from '../../database/entities/audit/outbox-event.entity';
import { EVENT_TYPES } from '../../common/constants/event-types';
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
    @InjectRepository(ProjectComponent) private readonly components: Repository<ProjectComponent>,
    @InjectRepository(ProjectVersion) private readonly versions: Repository<ProjectVersion>,
    @InjectRepository(CustomFieldContext) private readonly customFieldContexts: Repository<CustomFieldContext>,
    @InjectRepository(CustomField) private readonly customFields: Repository<CustomField>,
    @InjectRepository(CustomFieldOption) private readonly customFieldOptions: Repository<CustomFieldOption>,
    @InjectRepository(IssueCustomFieldValue) private readonly customFieldValues: Repository<IssueCustomFieldValue>,
    @InjectRepository(ActivityLog) private readonly activityLogs: Repository<ActivityLog>,
    @InjectRepository(OutboxEvent) private readonly outboxEvents: Repository<OutboxEvent>,
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
    const [state, issueType, labels, watchers, rawLinks, transitions, history, component, fixVersion, contexts, values] = await Promise.all([
      this.getCachedState(issue.stateId),
      this.getCachedType(issue.issueTypeId),
      this.issueLabels.createQueryBuilder('il').innerJoin(Label, 'label', 'label.id = il.label_id').where('il.issue_id = :issueId', { issueId: issue.id }).select('label.id', 'id').addSelect('label.name', 'name').getRawMany(),
      this.watchers.find({ where: { issueId: issue.id } }),
      this.links.find({ where: [{ issueId: issue.id }, { linkedIssueId: issue.id }] }),
      this.getCachedTransitions(issue.workflowId, issue.stateId),
      this.history.find({ where: { issueId: issue.id }, order: { occurredAt: 'DESC' }, take: 50 }),
      issue.componentId ? this.components.findOne({ where: { id: issue.componentId } }) : Promise.resolve(null),
      issue.fixVersionId ? this.versions.findOne({ where: { id: issue.fixVersionId } }) : Promise.resolve(null),
      this.customFieldContexts.find({ where: { projectId: issue.projectId, issueTypeId: issue.issueTypeId }, order: { position: 'ASC' } }),
      this.customFieldValues.find({ where: { issueId: issue.id } }),
    ]);

    const customFields = await Promise.all(contexts.map(async (ctx) => {
      const field = await this.customFields.findOne({ where: { id: ctx.customFieldId } });
      const val = values.find(v => v.customFieldContextId === ctx.id);
      let options: CustomFieldOption[] = [];
      if (field?.fieldType === 'select') {
        options = await this.customFieldOptions.find({ where: { customFieldId: field.id }, order: { position: 'ASC' } });
      }
      return {
        contextId: ctx.id,
        fieldId: field?.id,
        key: field?.key,
        name: field?.name,
        fieldType: field?.fieldType,
        isRequired: ctx.isRequired,
        position: ctx.position,
        value: val ? val.valueJson : null,
        options,
      };
    }));

    const links = await Promise.all(rawLinks.map(async (l) => {
      const isOutward = l.issueId === issue.id;
      const targetId = isOutward ? l.linkedIssueId : l.issueId;
      const [target, linkType] = await Promise.all([
        this.issues.findOne({ where: { id: targetId } }),
        this.linkTypes.findOne({ where: { id: l.linkTypeId } }),
      ]);
      const targetState = target ? await this.getCachedState(target.stateId) : null;
      return {
        id: l.id,
        issueId: l.issueId,
        linkedIssueId: l.linkedIssueId,
        linkTypeId: l.linkTypeId,
        isOutward,
        linkType: linkType ? { id: linkType.id, key: linkType.key, outwardLabel: linkType.outwardLabel, inwardLabel: linkType.inwardLabel } : null,
        targetIssue: target ? { id: target.id, key: target.key, summary: target.summary, priority: target.priority, state: targetState?.name || 'Open' } : null,
      };
    }));

    return { ...issue, state, issueType, component, fixVersion, customFields, labels, watchers, links, transitions, history };
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
    const comment = await this.comments.save(this.comments.create({ orgId, issueId: issue.id, authorMemberId: memberId, parentCommentId: input.parentCommentId ?? null, body: input.body.trim(), bodyFormat: 'plain', deletedAt: null }));
    const payload = { issueId: issue.id, commentId: comment.id, authorMemberId: memberId };
    await this.activityLogs.save(this.activityLogs.create({ orgId, actorType: 'member', actorMemberId: memberId, projectId: issue.projectId, issueId: issue.id, eventType: EVENT_TYPES.COMMENT_CREATED, payloadJson: payload }));
    await this.outboxEvents.save(this.outboxEvents.create({ orgId, aggregateType: 'issue', aggregateId: issue.id, eventType: EVENT_TYPES.COMMENT_CREATED, payloadJson: payload, status: 'pending', idempotencyKey: `comment-created:${comment.id}`, publishedAt: null, retryCount: 0, lastError: null }));
    return comment;
  }

  listComments(orgId: string, issueId: string, memberId: string, pagination: PaginationDto) { return this.accessibleIssue(orgId, issueId, memberId).then(() => paginate(this.comments.createQueryBuilder('comment').where('comment.org_id = :orgId AND comment.issue_id = :issueId AND comment.deleted_at IS NULL', { orgId, issueId }).orderBy('comment.created_at', 'ASC'), pagination)); }

  async deleteComment(orgId: string, issueId: string, commentId: string, memberId: string) {
    await this.accessibleIssue(orgId, issueId, memberId);
    const comment = await this.comments.findOne({ where: { id: commentId, orgId, issueId, authorMemberId: memberId, deletedAt: IsNull() } });
    if (!comment) throw new NotFoundException('Comment not found');
    comment.deletedAt = new Date();
    await this.comments.save(comment);
    const payload = { issueId, commentId, deletedByMemberId: memberId };
    await this.activityLogs.save(this.activityLogs.create({ orgId, actorType: 'member', actorMemberId: memberId, issueId, eventType: EVENT_TYPES.COMMENT_DELETED, payloadJson: payload }));
    return { success: true, commentId };
  }

  async addWorkLog(orgId: string, issueId: string, memberId: string, input: CreateWorkLogDto) {
    await this.accessibleIssue(orgId, issueId, memberId);
    return this.dataSource.transaction(async (manager) => {
      const locked = await manager.findOne(Issue, { where: { id: issueId, orgId, deletedAt: IsNull() }, lock: { mode: 'pessimistic_write' } });
      if (!locked) throw new NotFoundException('Issue not found');
      const workLog = await manager.save(WorkLog, manager.create(WorkLog, { issueId: locked.id, authorMemberId: memberId, timeSpentSeconds: input.timeSpentSeconds, startedAt: new Date(input.startedAt), comment: input.comment?.trim() || null, deletedAt: null }));
      locked.timeSpentSeconds += input.timeSpentSeconds;
      locked.version += 1;
      await manager.save(locked);
      const payload = { issueId: locked.id, workLogId: workLog.id, timeSpentSeconds: input.timeSpentSeconds, authorMemberId: memberId };
      await manager.save(ActivityLog, manager.create(ActivityLog, { orgId, actorType: 'member', actorMemberId: memberId, projectId: locked.projectId, issueId: locked.id, eventType: EVENT_TYPES.WORKLOG_CREATED, payloadJson: payload }));
      await manager.save(OutboxEvent, manager.create(OutboxEvent, { orgId, aggregateType: 'issue', aggregateId: locked.id, eventType: EVENT_TYPES.WORKLOG_CREATED, payloadJson: payload, status: 'pending', idempotencyKey: `worklog-created:${workLog.id}`, publishedAt: null, retryCount: 0, lastError: null }));
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
    const result = await this.issueLabels.save(this.issueLabels.create({ issueId: issue.id, labelId: label.id, addedByMemberId: memberId }));
    const payload = { issueId: issue.id, label: label.name, addedByMemberId: memberId };
    await this.activityLogs.save(this.activityLogs.create({ orgId, actorType: 'member', actorMemberId: memberId, projectId: issue.projectId, issueId: issue.id, eventType: EVENT_TYPES.ISSUE_UPDATED, payloadJson: payload }));
    return result;
  }

  async addWatcher(orgId: string, issueId: string, memberId: string, input: AddWatcherDto) {
    const issue = await this.accessibleIssue(orgId, issueId, memberId);
    const watcher = await this.projectMembers.findOne({ where: { projectId: issue.projectId, orgMemberId: input.memberId, status: 'active' } });
    if (!watcher) throw new ForbiddenException('Watcher must be an active project member');
    if (await this.watchers.exists({ where: { issueId, orgMemberId: input.memberId } })) throw new ConflictException('Member is already watching this issue');
    const result = await this.watchers.save(this.watchers.create({ issueId, orgMemberId: input.memberId }));
    const payload = { issueId: issue.id, watcherMemberId: input.memberId };
    await this.activityLogs.save(this.activityLogs.create({ orgId, actorType: 'member', actorMemberId: memberId, projectId: issue.projectId, issueId: issue.id, eventType: EVENT_TYPES.WATCHER_ADDED, payloadJson: payload }));
    return result;
  }

  async linkIssue(orgId: string, issueId: string, memberId: string, input: CreateIssueLinkDto) {
    const issue = await this.accessibleIssue(orgId, issueId, memberId);
    const linked = await this.accessibleIssue(orgId, input.linkedIssueId, memberId);
    if (issue.id === linked.id) throw new ConflictException('Issue cannot link to itself');
    const type = await this.linkTypes.findOne({ where: { id: input.linkTypeId, orgId, archivedAt: IsNull() } });
    if (!type) throw new NotFoundException('Link type not found');
    const [source, target] = type.directionality === 'symmetric' && issue.id > linked.id ? [linked, issue] : [issue, linked];
    if (await this.links.exists({ where: { orgId, issueId: source.id, linkedIssueId: target.id, linkTypeId: type.id } })) throw new ConflictException('Issue link already exists');
    const link = await this.links.save(this.links.create({ orgId, issueId: source.id, linkedIssueId: target.id, linkTypeId: type.id, createdByMemberId: memberId }));
    const payload = { sourceIssueId: source.id, targetIssueId: target.id, linkTypeId: type.id, linkId: link.id };
    await this.activityLogs.save(this.activityLogs.create({ orgId, actorType: 'member', actorMemberId: memberId, projectId: issue.projectId, issueId: issue.id, eventType: EVENT_TYPES.ISSUE_LINKED, payloadJson: payload }));
    await this.outboxEvents.save(this.outboxEvents.create({ orgId, aggregateType: 'issue', aggregateId: issue.id, eventType: EVENT_TYPES.ISSUE_LINKED, payloadJson: payload, status: 'pending', idempotencyKey: `issue-linked:${link.id}`, publishedAt: null, retryCount: 0, lastError: null }));
    return link;
  }

  async deleteLink(orgId: string, issueId: string, linkId: string, memberId: string) {
    const issue = await this.accessibleIssue(orgId, issueId, memberId);
    const link = await this.links.findOne({ where: [{ id: linkId, issueId: issue.id }, { id: linkId, linkedIssueId: issue.id }] });
    if (!link) throw new NotFoundException('Link not found');
    await this.links.delete({ id: link.id });
    const payload = { issueId: issue.id, linkId: link.id, deletedByMemberId: memberId };
    await this.activityLogs.save(this.activityLogs.create({ orgId, actorType: 'member', actorMemberId: memberId, projectId: issue.projectId, issueId: issue.id, eventType: EVENT_TYPES.ISSUE_UNLINKED, payloadJson: payload }));
    return { success: true, linkId };
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
      if (input.componentId !== undefined) locked.componentId = input.componentId || null;
      if (input.fixVersionId !== undefined) locked.fixVersionId = input.fixVersionId || null;
      locked.version += 1;
      const saved = await manager.save(locked);

      const payload = { issueId: saved.id, issueKey: saved.key, projectId: saved.projectId, updatedByMemberId: memberId, version: saved.version };
      await manager.save(ActivityLog, manager.create(ActivityLog, { orgId, actorType: 'member', actorMemberId: memberId, projectId: saved.projectId, issueId: saved.id, eventType: EVENT_TYPES.ISSUE_UPDATED, payloadJson: payload }));
      await manager.save(OutboxEvent, manager.create(OutboxEvent, { orgId, aggregateType: 'issue', aggregateId: saved.id, eventType: EVENT_TYPES.ISSUE_UPDATED, payloadJson: payload, status: 'pending', idempotencyKey: `issue-updated:${saved.id}:${saved.version}`, publishedAt: null, retryCount: 0, lastError: null }));

      return saved;
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
      const payload = { issueId: locked.id, issueKey: locked.key, projectId: locked.projectId, deletedByMemberId: memberId };
      await manager.save(ActivityLog, manager.create(ActivityLog, { orgId, actorType: 'member', actorMemberId: memberId, projectId: locked.projectId, issueId: locked.id, eventType: EVENT_TYPES.ISSUE_DELETED, payloadJson: payload }));
      await manager.save(OutboxEvent, manager.create(OutboxEvent, { orgId, aggregateType: 'issue', aggregateId: locked.id, eventType: EVENT_TYPES.ISSUE_DELETED, payloadJson: payload, status: 'pending', idempotencyKey: `issue-deleted:${locked.id}`, publishedAt: null, retryCount: 0, lastError: null }));
      return { success: true, id: issue.id, key: issue.key, deletedAt: locked.deletedAt };
    });
  }

  async transition(orgId: string, issueId: string, memberId: string, input: any) {
    const issue = await this.accessibleIssue(orgId, issueId, memberId);
    let transition: WorkflowTransition | null = null;

    if (input.transitionKey) {
      transition = await this.transitions.findOne({
        where: { workflowId: issue.workflowId, key: input.transitionKey, fromStateId: issue.stateId },
      });
    } else if (input.toStateId) {
      transition = await this.transitions.findOne({
        where: { workflowId: issue.workflowId, fromStateId: issue.stateId, toStateId: input.toStateId },
      });
      if (!transition) {
        transition = await this.transitions.findOne({
          where: { workflowId: issue.workflowId, toStateId: input.toStateId },
        });
      }
    } else if (input.targetStatusName) {
      const allStates = await this.states.find({ where: { workflowId: issue.workflowId } });
      const targetState = allStates.find((s) => s.name.toLowerCase() === String(input.targetStatusName).toLowerCase());
      if (targetState) {
        transition = await this.transitions.findOne({
          where: { workflowId: issue.workflowId, fromStateId: issue.stateId, toStateId: targetState.id },
        });
        if (!transition) {
          transition = await this.transitions.findOne({
            where: { workflowId: issue.workflowId, toStateId: targetState.id },
          });
        }
      }
    }

    let target: WorkflowState | null = null;
    if (transition) {
      target = await this.states.findOne({ where: { id: transition.toStateId } });
    } else if (input.toStateId) {
      target = await this.states.findOne({ where: { id: input.toStateId, workflowId: issue.workflowId } });
    }
    if (!target) throw new NotFoundException('Target workflow state or valid transition not found');

    if (!transition) {
      transition = (await this.transitions.findOne({ where: { workflowId: issue.workflowId, toStateId: target.id } })) ??
                   (await this.transitions.findOne({ where: { workflowId: issue.workflowId } }));
    }

    const effectiveTransitionId = transition ? transition.id : target.id;

    return this.dataSource.transaction(async (manager) => {
      const locked = await manager.findOne(Issue, { where: { id: issueId, orgId, deletedAt: IsNull() }, lock: { mode: 'pessimistic_write' } });
      if (!locked) throw new NotFoundException('Issue not found');
      locked.stateId = target!.id;
      locked.version += 1;
      locked.resolvedAt = target!.isTerminal ? new Date() : null;
      await manager.save(locked);
      await manager.save(IssueStateHistory, manager.create(IssueStateHistory, {
        orgId,
        issueId,
        fromStateId: transition ? transition.fromStateId : issue.stateId,
        toStateId: target!.id,
        transitionId: effectiveTransitionId,
        actorMemberId: memberId,
        comment: input.comment || null,
        idempotencyKey: input.idempotencyKey || null,
        versionBefore: locked.version - 1,
        versionAfter: locked.version,
      }));
      const payload = { issueId: locked.id, projectId: locked.projectId, fromStateId: transition ? transition.fromStateId : issue.stateId, toStateId: target!.id, version: locked.version };
      await manager.save(ActivityLog, manager.create(ActivityLog, { orgId, actorType: 'member', actorMemberId: memberId, projectId: locked.projectId, issueId: locked.id, eventType: EVENT_TYPES.ISSUE_TRANSITIONED, payloadJson: payload }));
      await manager.save(OutboxEvent, manager.create(OutboxEvent, { orgId, aggregateType: 'issue', aggregateId: locked.id, eventType: EVENT_TYPES.ISSUE_TRANSITIONED, payloadJson: payload, status: 'pending', idempotencyKey: `issue-transition:${locked.id}:${locked.version}`, publishedAt: null, retryCount: 0, lastError: null }));
      return { ...locked, state: target };
    });
  }
}
