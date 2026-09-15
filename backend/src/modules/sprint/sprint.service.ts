import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import { Board } from '../../database/entities/project/board.entity';
import { Sprint } from '../../database/entities/project/sprint.entity';
import { Issue } from '../../database/entities/issue/issue.entity';
import { IssueSprintHistory } from '../../database/entities/issue/issue-sprint-history.entity';
import { Project } from '../../database/entities/project/project.entity';
import { WorkflowState } from '../../database/entities/workflow/workflow-state.entity';
import { ActivityLog } from '../../database/entities/audit/activity-log.entity';
import { OutboxEvent } from '../../database/entities/audit/outbox-event.entity';
import { EVENT_TYPES } from '../../common/constants/event-types';
import { CreateSprintDto } from './dto/sprint.dto';

@Injectable()
export class SprintService {
  constructor(
    @InjectRepository(Board) private readonly boards: Repository<Board>,
    @InjectRepository(Sprint) private readonly sprints: Repository<Sprint>,
    @InjectRepository(Issue) private readonly issues: Repository<Issue>,
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    @InjectRepository(WorkflowState) private readonly states: Repository<WorkflowState>,
    @InjectRepository(ActivityLog) private readonly activityLogs: Repository<ActivityLog>,
    @InjectRepository(OutboxEvent) private readonly outboxEvents: Repository<OutboxEvent>,
    private readonly dataSource: DataSource,
  ) {}

  async create(orgId: string, projectId: string, boardId: string, input: CreateSprintDto) {
    if (!await this.projects.exists({ where: { id: projectId, orgId, archivedAt: IsNull() } })) throw new NotFoundException('Project not found');
    const board = await this.boards.findOne({ where: { id: boardId, projectId, boardType: 'scrum' } });
    if (!board) throw new ConflictException('Sprints require a Scrum board');
    const sprint = await this.sprints.save(this.sprints.create({ projectId, boardId, name: input.name.trim(), goal: input.goal?.trim() ?? null, state: 'planned', startAt: null, endAt: null, closedAt: null }));
    const payload = { sprintId: sprint.id, projectId, boardId, name: sprint.name };
    await this.activityLogs.save(this.activityLogs.create({ orgId, actorType: 'system', projectId, eventType: EVENT_TYPES.SPRINT_CREATED, payloadJson: payload }));
    return sprint;
  }

  async start(orgId: string, projectId: string, sprintId: string) {
    return this.dataSource.transaction(async (manager) => {
      if (!await manager.exists(Project, { where: { id: projectId, orgId, archivedAt: IsNull() } })) throw new NotFoundException('Project not found');
      const sprint = await manager.findOne(Sprint, { where: { id: sprintId, projectId } });
      if (!sprint) throw new NotFoundException('Sprint not found');
      if (sprint.state !== 'planned') throw new ConflictException('Only planned sprints can start');
      const active = await manager.findOne(Sprint, { where: { boardId: sprint.boardId, state: 'active' } });
      if (active) throw new ConflictException('Board already has an active sprint');
      sprint.state = 'active'; sprint.startAt = new Date();
      const saved = await manager.save(sprint);
      const payload = { sprintId: saved.id, projectId, boardId: saved.boardId };
      await manager.save(ActivityLog, manager.create(ActivityLog, { orgId, actorType: 'system', projectId, eventType: EVENT_TYPES.SPRINT_STARTED, payloadJson: payload }));
      await manager.save(OutboxEvent, manager.create(OutboxEvent, { orgId, aggregateType: 'sprint', aggregateId: saved.id, eventType: EVENT_TYPES.SPRINT_STARTED, payloadJson: payload, status: 'pending', idempotencyKey: `sprint-started:${saved.id}`, publishedAt: null, retryCount: 0, lastError: null }));
      return saved;
    });
  }

  async close(orgId: string, projectId: string, sprintId: string) {
    return this.dataSource.transaction(async (manager) => {
      if (!await manager.exists(Project, { where: { id: projectId, orgId, archivedAt: IsNull() } })) throw new NotFoundException('Project not found');
      const sprint = await manager.findOne(Sprint, { where: { id: sprintId, projectId } });
      if (!sprint) throw new NotFoundException('Sprint not found');
      if (sprint.state !== 'active') throw new ConflictException('Only active sprints can close');
      sprint.state = 'closed';
      sprint.closedAt = new Date();
      const savedSprint = await manager.save(sprint);

      // TC-SPR-005: Rollover uncompleted issues back to backlog
      const sprintIssues = await manager.find(Issue, { where: { sprintId: sprint.id, deletedAt: IsNull() } });
      for (const issue of sprintIssues) {
        const state = await manager.findOne(WorkflowState, { where: { id: issue.stateId } });
        const isDone = Boolean(issue.resolvedAt) || state?.category === 'done' || state?.isTerminal === true;
        if (!isDone) {
          issue.sprintId = null;
          issue.version += 1;
          await manager.save(issue);
          await manager.update(IssueSprintHistory, { issueId: issue.id, sprintId: sprint.id, removedAt: IsNull() }, { removedAt: new Date() });
        }
      }

      const payload = { sprintId: savedSprint.id, projectId, closedAt: savedSprint.closedAt };
      await manager.save(ActivityLog, manager.create(ActivityLog, { orgId, actorType: 'system', projectId, eventType: EVENT_TYPES.SPRINT_CLOSED, payloadJson: payload }));
      await manager.save(OutboxEvent, manager.create(OutboxEvent, { orgId, aggregateType: 'sprint', aggregateId: savedSprint.id, eventType: EVENT_TYPES.SPRINT_CLOSED, payloadJson: payload, status: 'pending', idempotencyKey: `sprint-closed:${savedSprint.id}`, publishedAt: null, retryCount: 0, lastError: null }));
      return savedSprint;
    });
  }

  async assign(orgId: string, projectId: string, sprintId: string, issueId: string, memberId: string) {
    return this.dataSource.transaction(async (manager) => {
      if (!await manager.exists(Project, { where: { id: projectId, orgId, archivedAt: IsNull() } })) throw new NotFoundException('Project not found');
      const sprint = await manager.findOne(Sprint, { where: { id: sprintId, projectId } });
      const issue = await manager.findOne(Issue, { where: { id: issueId, projectId } });
      if (!sprint || !issue) throw new NotFoundException('Sprint or issue not found');
      if (sprint.state === 'closed') throw new ConflictException('Cannot assign to a closed sprint');
      if (issue.sprintId === sprintId) return issue;
      if (issue.sprintId) {
        await manager.update(IssueSprintHistory, { issueId, sprintId: issue.sprintId, removedAt: IsNull() }, { removedAt: new Date(), removedByMemberId: memberId });
      }
      issue.sprintId = sprintId;
      await manager.save(issue);
      await manager.save(IssueSprintHistory, manager.create(IssueSprintHistory, { issueId, sprintId, addedByMemberId: memberId, removedByMemberId: null, removedAt: null }));
      const payload = { issueId, sprintId, memberId, projectId };
      await manager.save(ActivityLog, manager.create(ActivityLog, { orgId, actorType: 'member', actorMemberId: memberId, projectId, issueId, eventType: EVENT_TYPES.ISSUE_ADDED_TO_SPRINT, payloadJson: payload }));
      return issue;
    });
  }

  async list(orgId: string, projectId: string) {
    const exists = await this.projects.exists({ where: { id: projectId, orgId, archivedAt: IsNull() } });
    if (!exists) throw new NotFoundException('Project not found');
    const sprints = await this.sprints.find({ where: { projectId }, order: { createdAt: 'DESC' } });
    if (!sprints.length) return [];
    const sprintIds = sprints.map((s) => s.id);
    const sprintIssues = await this.issues.find({
      where: { sprintId: In(sprintIds), projectId, deletedAt: IsNull() },
      order: { createdAt: 'ASC' },
    });
    const issueMap = new Map<string, any[]>();
    for (const issue of sprintIssues) {
      const list = issueMap.get(issue.sprintId!) || [];
      list.push(issue);
      issueMap.set(issue.sprintId!, list);
    }
    return sprints.map((s) => ({
      ...s,
      issues: issueMap.get(s.id) || [],
    }));
  }
}
