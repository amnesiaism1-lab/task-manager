import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import { Project } from '../../database/entities/project/project.entity';
import { ProjectRole } from '../../database/entities/project/project-role.entity';
import { ProjectMember } from '../../database/entities/project/project-member.entity';
import { ProjectMemberRole } from '../../database/entities/project/project-member-role.entity';
import { ProjectGroupRole } from '../../database/entities/project/project-group-role.entity';
import { Group } from '../../database/entities/identity/group.entity';
import { ProjectComponent } from '../../database/entities/project/project-component.entity';
import { ProjectVersion } from '../../database/entities/project/project-version.entity';
import { PermissionScheme } from '../../database/entities/project/permission-scheme.entity';
import { PermissionSchemeEntry } from '../../database/entities/project/permission-scheme-entry.entity';
import { Board } from '../../database/entities/project/board.entity';
import { BoardColumn } from '../../database/entities/project/board-column.entity';
import { BoardColumnState } from '../../database/entities/workflow/board-column-state.entity';
import { OrganizationMember } from '../../database/entities/identity/organization-member.entity';
import { User } from '../../database/entities/identity/user.entity';
import { Workflow } from '../../database/entities/workflow/workflow.entity';
import { WorkflowState } from '../../database/entities/workflow/workflow-state.entity';
import { WorkflowTransition } from '../../database/entities/workflow/workflow-transition.entity';
import { WorkflowTransitionGuard } from '../../database/entities/workflow/workflow-transition-guard.entity';
import { IssueType } from '../../database/entities/issue/issue-type.entity';
import { Issue } from '../../database/entities/issue/issue.entity';
import { IssueStateHistory } from '../../database/entities/issue/issue-state-history.entity';
import { Comment } from '../../database/entities/issue/comment.entity';
import { ActivityLog } from '../../database/entities/audit/activity-log.entity';
import { OutboxEvent } from '../../database/entities/audit/outbox-event.entity';
import { EVENT_TYPES } from '../../common/constants/event-types';
import { BoardIssuePosition } from '../../database/entities/project/board-issue-position.entity';
import { Sprint } from '../../database/entities/project/sprint.entity';
import { LexoRank } from '../../common/utils/lexorank.util';
import { AddProjectMemberDto, AssignProjectGroupRoleDto, AssignProjectRoleDto, CreateComponentDto, CreateIssueDto, CreateProjectDto, CreateProjectRoleDto, CreateVersionDto, TransitionIssueDto, UpdateComponentDto, UpdateIssueDto, UpdateProjectDto, UpdateVersionDto } from './dto/project.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/pagination.util';
import { PROJECT_PERMISSIONS } from '../../common/constants/permission-keys';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    @InjectRepository(ProjectMember) private readonly projectMembers: Repository<ProjectMember>,
    @InjectRepository(OrganizationMember) private readonly orgMembers: Repository<OrganizationMember>,
    @InjectRepository(ProjectRole) private readonly projectRoles: Repository<ProjectRole>,
    @InjectRepository(ProjectMemberRole) private readonly projectMemberRoles: Repository<ProjectMemberRole>,
    @InjectRepository(ProjectGroupRole) private readonly projectGroupRoles: Repository<ProjectGroupRole>,
    @InjectRepository(Group) private readonly groups: Repository<Group>,
    @InjectRepository(ProjectComponent) private readonly components: Repository<ProjectComponent>,
    @InjectRepository(ProjectVersion) private readonly versions: Repository<ProjectVersion>,
    @InjectRepository(PermissionScheme) private readonly permissionSchemes: Repository<PermissionScheme>,
    @InjectRepository(PermissionSchemeEntry) private readonly permissionEntries: Repository<PermissionSchemeEntry>,
    @InjectRepository(Issue) private readonly issues: Repository<Issue>,
    @InjectRepository(Sprint) private readonly sprints: Repository<Sprint>,
    @InjectRepository(WorkflowTransitionGuard) private readonly transitionGuards: Repository<WorkflowTransitionGuard>,
    private readonly dataSource: DataSource,
  ) {}

  async create(orgId: string, creatorMemberId: string, input: CreateProjectDto) {
    const key = input.key.trim().toUpperCase();
    const duplicate = await this.projects.findOne({ where: { orgId, key } });
    if (duplicate) throw new ConflictException('Project key already exists');
    return this.dataSource.transaction(async (manager) => {
      const workflowKey = `${key.toLowerCase()}-default`;
      const project = await manager.save(Project, manager.create(Project, {
        orgId,
        key,
        name: input.name.trim(),
        description: input.description ?? null,
        visibility: input.visibility ?? 'private',
        departmentId: input.departmentId ?? null,
        createdByMemberId: creatorMemberId,
        workflowKey,
        nextIssueNumber: 1,
        archivedAt: null,
      }));
      const projectAdmin = await manager.save(ProjectRole, manager.create(ProjectRole, { projectId: project.id, key: 'project-admin', name: 'Project administrator', description: 'Project administration' }));
      const memberRole = await manager.save(ProjectRole, manager.create(ProjectRole, { projectId: project.id, key: 'member', name: 'Member', description: 'Project member' }));
      const projectMember = await manager.save(ProjectMember, manager.create(ProjectMember, { projectId: project.id, orgMemberId: creatorMemberId, status: 'active', joinedAt: new Date() }));
      await manager.save(ProjectMemberRole, manager.create(ProjectMemberRole, { projectMemberId: projectMember.id, projectRoleId: projectAdmin.id, grantedByMemberId: creatorMemberId }));
      const permissionScheme = await manager.save(PermissionScheme, manager.create(PermissionScheme, { projectId: project.id, name: `${project.name} permissions`, description: 'Default project permission scheme' }));
      project.permissionSchemeId = permissionScheme.id;
      await manager.save(project);
      const collaborationPermissions = ['ADD_COMMENT', 'DELETE_COMMENT', 'ADD_ATTACHMENT', 'DELETE_ATTACHMENT', 'LOG_WORK', 'LINK_ISSUE', 'MANAGE_WATCHERS'];
      const adminPermissions = ['BROWSE_PROJECT', 'CREATE_ISSUE', 'EDIT_ISSUE', 'TRANSITION_ISSUE', 'MANAGE_PROJECT', 'MANAGE_MEMBERS', 'MANAGE_BOARD', 'MANAGE_SPRINTS', 'MANAGE_COMPONENTS', 'MANAGE_VERSIONS', ...collaborationPermissions];
      const memberPermissions = ['BROWSE_PROJECT', 'CREATE_ISSUE', 'EDIT_ISSUE', 'TRANSITION_ISSUE', ...collaborationPermissions];
      await manager.save(PermissionSchemeEntry, [
        ...adminPermissions.map((permissionKey) => manager.create(PermissionSchemeEntry, { schemeId: permissionScheme.id, permissionKey, projectRoleId: projectAdmin.id })),
        ...memberPermissions.map((permissionKey) => manager.create(PermissionSchemeEntry, { schemeId: permissionScheme.id, permissionKey, projectRoleId: memberRole.id })),
      ]);
      const board = await manager.save(Board, manager.create(Board, { projectId: project.id, boardType: input.boardType ?? 'kanban', name: `${project.name} board`, description: null }));
      const workflow = await manager.save(Workflow, manager.create(Workflow, { orgId, key: `${key.toLowerCase()}-default`, name: `${project.name} workflow`, version: 1, isActive: true }));
      const todo = await manager.save(WorkflowState, manager.create(WorkflowState, { workflowId: workflow.id, key: 'todo', name: 'To Do', category: 'todo', isInitial: true, isTerminal: false, position: 0 }));
      const done = await manager.save(WorkflowState, manager.create(WorkflowState, { workflowId: workflow.id, key: 'done', name: 'Done', category: 'done', isInitial: false, isTerminal: true, position: 1 }));
      const todoColumn = await manager.save(BoardColumn, manager.create(BoardColumn, { boardId: board.id, name: 'To Do', position: 0, wipLimit: null }));
      const doneColumn = await manager.save(BoardColumn, manager.create(BoardColumn, { boardId: board.id, name: 'Done', position: 1, wipLimit: null }));
      await manager.save(BoardColumnState, [
        manager.create(BoardColumnState, { boardColumnId: todoColumn.id, workflowStateId: todo.id }),
        manager.create(BoardColumnState, { boardColumnId: doneColumn.id, workflowStateId: done.id }),
      ]);
      await manager.save(WorkflowTransition, manager.create(WorkflowTransition, { workflowId: workflow.id, key: 'complete', name: 'Complete', fromStateId: todo.id, toStateId: done.id, requireComment: false, sortOrder: 0 }));
      let issueType = await manager.findOne(IssueType, { where: { orgId, key: 'task' } });
      if (!issueType) issueType = await manager.save(IssueType, manager.create(IssueType, { orgId, key: 'task', name: 'Task', description: 'Default task' }));
      return { project, projectAdminRole: projectAdmin, board, workflow, initialState: todo, issueType };
    });
  }

  async list(orgId: string, memberId: string, pagination: PaginationDto) {
    const query = this.projects.createQueryBuilder('project')
      .innerJoin(ProjectMember, 'membership', 'membership.project_id = project.id AND membership.org_member_id = :memberId AND membership.status = :status', { memberId, status: 'active' })
      .where('project.org_id = :orgId', { orgId })
      .andWhere('project.archived_at IS NULL')
      .orderBy('project.key', 'ASC');
    return paginate(query, pagination);
  }

  async createIssue(orgId: string, projectId: string, reporterMemberId: string, input: CreateIssueDto) {
    const project = await this.projects.findOne({ where: { id: projectId, orgId } });
    if (!project || project.archivedAt) throw new NotFoundException('Project not found or archived');
    const membership = await this.projectMembers.findOne({ where: { projectId, orgMemberId: reporterMemberId, status: 'active' } });
    if (!membership) throw new ForbiddenException('Project membership required');
    return this.dataSource.transaction(async (manager) => {
      const lockedProject = await manager.findOne(Project, { where: { id: projectId, orgId }, lock: { mode: 'pessimistic_write' } });
      if (!lockedProject) throw new NotFoundException('Project not found');
      const issueType = await manager.findOne(IssueType, { where: { orgId, key: input.issueTypeKey.toLowerCase() } });
      const workflow = await manager.findOne(Workflow, { where: { orgId, key: lockedProject.workflowKey ?? '', isActive: true } });
      if (!issueType || !workflow) throw new NotFoundException('Issue type or workflow not found');
      const state = await manager.findOne(WorkflowState, { where: { workflowId: workflow.id, isInitial: true } });
      if (!state) throw new ConflictException('Workflow has no initial state');
      const issueNumber = Number(lockedProject.nextIssueNumber);
      lockedProject.nextIssueNumber = issueNumber + 1;
      await manager.save(lockedProject);
      let assigneeMemberId: string | null = null;
      if (input.assigneeMemberId) {
        let assignee = await manager.findOne(ProjectMember, { where: { projectId, orgMemberId: input.assigneeMemberId, status: 'active' } });
        if (!assignee) {
          const orgMember = await manager.findOne(OrganizationMember, { where: { id: input.assigneeMemberId, orgId, status: 'active' } });
          if (orgMember) {
            assignee = await manager.save(ProjectMember, manager.create(ProjectMember, {
              projectId,
              orgMemberId: input.assigneeMemberId,
              status: 'active',
              joinedAt: new Date(),
            }));
          } else {
            throw new ForbiddenException('Assignee must be an active project member');
          }
        }
        assigneeMemberId = input.assigneeMemberId;
      }
      let sprintId: string | null = null;
      if (input.sprintId) {
        const sprint = await manager.findOne(Sprint, { where: { id: input.sprintId, projectId } });
        if (sprint) sprintId = sprint.id;
      }
      const issue = await manager.save(Issue, manager.create(Issue, {
        orgId,
        projectId,
        issueTypeId: issueType.id,
        workflowId: workflow.id,
        stateId: state.id,
        key: `${lockedProject.key}-${issueNumber}`,
        summary: input.summary.trim(),
        description: input.description ?? null,
        reporterMemberId,
        assigneeMemberId,
        sprintId,
        parentIssueId: input.parentIssueId ?? null,
        dueAt: input.dueAt ? new Date(input.dueAt) : null,
        originalEstimateSeconds: input.originalEstimateSeconds ?? null,
        remainingEstimateSeconds: input.originalEstimateSeconds ?? null,
        priority: input.priority || 'Medium',
        componentId: input.componentId || null,
        fixVersionId: input.fixVersionId || null,
        timeSpentSeconds: 0,
        version: 1,
        resolvedAt: null,
        archivedAt: null,
        deletedAt: null
      }));
      const board = await manager.findOne(Board, { where: { projectId }, order: { createdAt: 'ASC' } });
      if (board) {
        const last = await manager.find(BoardIssuePosition, { where: { boardId: board.id }, order: { rank: 'DESC' }, take: 1 });
        let rank = LexoRank.between(last[0]?.rank ?? null, null);
        while (await manager.exists(BoardIssuePosition, { where: { boardId: board.id, rank } })) {
          rank = LexoRank.between(rank, null);
        }
        await manager.save(BoardIssuePosition, manager.create(BoardIssuePosition, { boardId: board.id, issueId: issue.id, rank }));
      }
      const payload = { issueId: issue.id, issueKey: issue.key, projectId, reporterMemberId };
      await manager.save(ActivityLog, manager.create(ActivityLog, { orgId, actorType: 'member', actorMemberId: reporterMemberId, projectId, issueId: issue.id, eventType: EVENT_TYPES.ISSUE_CREATED, payloadJson: payload }));
      await manager.save(OutboxEvent, manager.create(OutboxEvent, { orgId, aggregateType: 'issue', aggregateId: issue.id, eventType: EVENT_TYPES.ISSUE_CREATED, payloadJson: payload, status: 'pending', idempotencyKey: `issue-created:${issue.id}`, publishedAt: null, retryCount: 0, lastError: null }));
      return issue;
    });
  }

  async listIssues(orgId: string, projectId: string, memberId: string, pagination: PaginationDto) {
    const membership = await this.projectMembers.findOne({ where: { projectId, orgMemberId: memberId, status: 'active' } });
    if (!membership) throw new ForbiddenException('Project membership required');
    const query = this.issues.createQueryBuilder('issue').where('issue.org_id = :orgId AND issue.project_id = :projectId AND issue.deleted_at IS NULL', { orgId, projectId }).orderBy('issue.created_at', 'DESC');
    const result = await paginate(query, pagination);
    if (!result.data.length) return result;
    const assigneeIds = [...new Set(result.data.map((i: any) => i.assigneeMemberId).filter(Boolean))];
    const stateIds = [...new Set(result.data.map((i: any) => i.stateId).filter(Boolean))];
    const [states, members] = await Promise.all([
      stateIds.length ? this.dataSource.getRepository(WorkflowState).find({ where: { id: In(stateIds) } }) : Promise.resolve([]),
      assigneeIds.length
        ? this.orgMembers.createQueryBuilder('om')
            .innerJoin(User, 'user', 'user.id = om.user_id')
            .where('om.id IN (:...assigneeIds)', { assigneeIds })
            .select(['om.id AS id', 'user.id AS "userId"', 'user.full_name AS "fullName"', 'user.email AS email', 'user.avatar_url AS "avatarUrl"'])
            .getRawMany()
        : Promise.resolve([]),
    ]);
    const stateMap = new Map(states.map((s) => [s.id, s]));
    const memberMap = new Map(members.map((m) => [m.id, { id: m.id, userId: m.userId, fullName: m.fullName, email: m.email, avatarUrl: m.avatarUrl }]));
    result.data = result.data.map((issue: any) => {
      const assignee = issue.assigneeMemberId ? memberMap.get(issue.assigneeMemberId) || null : null;
      return {
        ...issue,
        state: stateMap.get(issue.stateId) || null,
        assignee,
        assigneeMember: assignee,
      };
    });
    return result;
  }

  async transitionIssue(orgId: string, projectId: string, issueId: string, actorMemberId: string, input: TransitionIssueDto) {
    return this.dataSource.transaction(async (manager) => {
      const issue = await manager.findOne(Issue, { where: { id: issueId, orgId, projectId, deletedAt: IsNull() }, lock: { mode: 'pessimistic_write' } });
      if (!issue) throw new NotFoundException('Issue not found');
      const expectedVersion = Number(input.expectedVersion);
      if (!Number.isInteger(expectedVersion) || expectedVersion !== issue.version) throw new ConflictException('Issue version is stale');
      if (input.idempotencyKey) {
        const previous = await manager.findOne(IssueStateHistory, { where: { issueId, idempotencyKey: input.idempotencyKey } });
        if (previous) return issue;
      }
      const transition = await manager.findOne(WorkflowTransition, { where: { workflowId: issue.workflowId, key: input.transitionKey, fromStateId: issue.stateId } });
      if (!transition) throw new NotFoundException('Transition not found');
      if (transition.requireComment && !input.comment?.trim()) throw new ConflictException('Comment is required for this transition');
      const guards = await manager.find(WorkflowTransitionGuard, { where: { transitionId: transition.id } });
      for (const guard of guards) {
        if (guard.guardType !== 'requires_fields') continue;
        const requiredFields = Array.isArray(guard.configJson.fields) ? guard.configJson.fields : [];
        const missingField = requiredFields.find((field) => typeof field === 'string' && !this.hasIssueFieldValue(issue, field));
        if (missingField) throw new ConflictException(`Transition guard requires field: ${missingField}`);
      }
      const target = await manager.findOneByOrFail(WorkflowState, { id: transition.toStateId, workflowId: issue.workflowId });
      if (input.comment?.trim()) {
        await manager.save(Comment, manager.create(Comment, { orgId, issueId, authorMemberId: actorMemberId, parentCommentId: null, body: input.comment.trim(), bodyFormat: 'plain', deletedAt: null }));
      }
      issue.stateId = target.id;
      issue.version += 1;
      issue.resolvedAt = target.isTerminal ? new Date() : null;
      await manager.save(issue);
      await manager.save(IssueStateHistory, manager.create(IssueStateHistory, { orgId, issueId, fromStateId: transition.fromStateId, toStateId: transition.toStateId, transitionId: transition.id, actorMemberId, comment: input.comment?.trim() ?? null, idempotencyKey: input.idempotencyKey ?? null, versionBefore: expectedVersion, versionAfter: issue.version }));
      const payload = { issueId, projectId, fromStateId: transition.fromStateId, toStateId: transition.toStateId, versionBefore: expectedVersion, versionAfter: issue.version };
      await manager.save(ActivityLog, manager.create(ActivityLog, { orgId, actorType: 'member', actorMemberId, projectId, issueId, eventType: EVENT_TYPES.ISSUE_TRANSITIONED, payloadJson: payload }));
      await manager.save(OutboxEvent, manager.create(OutboxEvent, { orgId, aggregateType: 'issue', aggregateId: issueId, eventType: EVENT_TYPES.ISSUE_TRANSITIONED, payloadJson: payload, status: 'pending', idempotencyKey: `issue-transition:${issueId}:${expectedVersion}`, publishedAt: null, retryCount: 0, lastError: null }));
      return issue;
    });
  }

  private hasIssueFieldValue(issue: Issue, field: string) {
    const value = (issue as unknown as Record<string, unknown>)[field];
    return value !== undefined && value !== null && value !== '';
  }

  async get(orgId: string, projectId: string, memberId: string) {
    const membership = await this.projectMembers.findOne({ where: { projectId, orgMemberId: memberId, status: 'active' } });
    if (!membership) throw new ForbiddenException('Project membership required');
    const project = await this.projects.findOne({ where: { id: projectId, orgId } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async archive(orgId: string, projectId: string, memberId: string) {
    const project = await this.get(orgId, projectId, memberId);
    project.archivedAt = new Date();
    return this.projects.save(project);
  }

  async update(orgId: string, projectId: string, memberId: string, input: UpdateProjectDto) {
    const project = await this.get(orgId, projectId, memberId);
    project.name = input.name.trim();
    if (input.description !== undefined) project.description = input.description?.trim() || null;
    if (input.visibility) project.visibility = input.visibility;
    if (input.departmentId !== undefined) project.departmentId = input.departmentId;
    return this.projects.save(project);
  }

  async restore(orgId: string, projectId: string, memberId: string) {
    const project = await this.projects.findOne({ where: { id: projectId, orgId } });
    if (!project) throw new NotFoundException('Project not found');
    await this.get(orgId, projectId, memberId);
    project.archivedAt = null;
    return this.projects.save(project);
  }

  async listRoles(orgId: string, projectId: string, memberId: string) {
    await this.get(orgId, projectId, memberId);
    return this.projectRoles.find({ where: { projectId }, order: { key: 'ASC' } });
  }

  async createRole(orgId: string, projectId: string, memberId: string, input: CreateProjectRoleDto) {
    await this.get(orgId, projectId, memberId);
    return this.projectRoles.save(this.projectRoles.create({ projectId, key: input.key.trim().toLowerCase(), name: input.name.trim(), description: input.description?.trim() ?? null }));
  }

  async assignDirectRole(orgId: string, projectId: string, actorMemberId: string, input: AssignProjectRoleDto) {
    await this.get(orgId, projectId, actorMemberId);
    const [membership, role] = await Promise.all([
      this.projectMembers.findOne({ where: { id: input.projectMemberId, projectId, status: 'active' } }),
      this.projectRoles.findOne({ where: { id: input.projectRoleId, projectId } }),
    ]);
    if (!membership || !role) throw new NotFoundException('Project member or role not found');
    const existing = await this.projectMemberRoles.findOne({ where: { projectMemberId: membership.id, projectRoleId: role.id } });
    return existing ?? this.projectMemberRoles.save(this.projectMemberRoles.create({ projectMemberId: membership.id, projectRoleId: role.id, grantedByMemberId: actorMemberId }));
  }

  async assignGroupRole(orgId: string, projectId: string, actorMemberId: string, input: AssignProjectGroupRoleDto) {
    await this.get(orgId, projectId, actorMemberId);
    const [group, role] = await Promise.all([
      this.groups.findOne({ where: { id: input.groupId, orgId } }),
      this.projectRoles.findOne({ where: { id: input.projectRoleId, projectId } }),
    ]);
    if (!group || !role) throw new NotFoundException('Group or project role not found');
    const existing = await this.projectGroupRoles.findOne({ where: { groupId: group.id, projectRoleId: role.id } });
    return existing ?? this.projectGroupRoles.save(this.projectGroupRoles.create({ groupId: group.id, projectRoleId: role.id, grantedByMemberId: actorMemberId }));
  }

  async effectivePermissions(orgId: string, projectId: string, actorMemberId: string, projectMemberId: string) {
    await this.get(orgId, projectId, actorMemberId);
    const membership = await this.projectMembers.findOne({ where: { id: projectMemberId, projectId, status: 'active' } });
    if (!membership) throw new NotFoundException('Project member not found');
    const direct = await this.projectMemberRoles.find({ where: { projectMemberId } });
    const member = await this.orgMembers.findOne({ where: { id: membership.orgMemberId, orgId } });
    const groupMemberships = member ? await this.groups.createQueryBuilder('group').innerJoin('group_members', 'gm', 'gm.group_id = group.id').where('gm.org_member_id = :memberId', { memberId: member.id }).select('group.id', 'id').getRawMany<{ id: string }>() : [];
    const groupRoles = groupMemberships.length ? await this.projectGroupRoles.find({ where: groupMemberships.map((item) => ({ groupId: item.id })) }) : [];
    const roleIds = [...new Set([...direct.map((role) => role.projectRoleId), ...groupRoles.map((role) => role.projectRoleId)])];
    if (!roleIds.length) return { projectMemberId, permissions: [] };
    const scheme = await this.permissionSchemes.findOneByOrFail({ projectId });
    const entries = await this.permissionEntries.find({ where: { schemeId: scheme.id, projectRoleId: In(roleIds) } });
    return { projectMemberId, roleIds, permissions: [...new Set(entries.map((entry) => entry.permissionKey))].sort() };
  }

  async getPermissionScheme(orgId: string, projectId: string, memberId: string) {
    await this.get(orgId, projectId, memberId);
    const scheme = await this.permissionSchemes.findOne({ where: { projectId } });
    if (!scheme) throw new NotFoundException('Permission scheme not found');
    return { scheme, entries: await this.permissionEntries.find({ where: { schemeId: scheme.id }, order: { permissionKey: 'ASC' } }) };
  }

  async setPermissionScheme(orgId: string, projectId: string, memberId: string, entries: Array<{ permissionKey: string; projectRoleId: string }>) {
    await this.get(orgId, projectId, memberId);
    const scheme = await this.permissionSchemes.findOne({ where: { projectId } });
    if (!scheme) throw new NotFoundException('Permission scheme not found');
    const roleIds = [...new Set(entries.map((entry) => entry.projectRoleId))];
    const uniqueEntries = new Set(entries.map((entry) => `${entry.permissionKey.trim()}:${entry.projectRoleId}`));
    if (uniqueEntries.size !== entries.length) throw new ConflictException('Permission scheme contains duplicate entries');
    if (entries.some((entry) => !Object.values(PROJECT_PERMISSIONS).includes(entry.permissionKey.trim() as typeof PROJECT_PERMISSIONS[keyof typeof PROJECT_PERMISSIONS]))) {
      throw new ConflictException('Permission scheme contains an unknown project permission');
    }
    const validRoles = roleIds.length ? await this.projectRoles.count({ where: { projectId, id: In(roleIds) } }) : 0;
    if (validRoles !== roleIds.length) throw new ForbiddenException('Permission entry role does not belong to project');
    const adminRole = await this.projectRoles.findOne({ where: { projectId, key: 'project-admin' } });
    if (!adminRole || !entries.some((entry) => entry.projectRoleId === adminRole.id && entry.permissionKey.trim() === 'MANAGE_PROJECT')) {
      throw new ConflictException('Project administrator must retain MANAGE_PROJECT');
    }
    await this.permissionEntries.delete({ schemeId: scheme.id });
    if (entries.length) await this.permissionEntries.save(entries.map((entry) => this.permissionEntries.create({ schemeId: scheme.id, permissionKey: entry.permissionKey.trim(), projectRoleId: entry.projectRoleId })));
    return this.getPermissionScheme(orgId, projectId, memberId);
  }

  async listMembers(orgId: string, projectId: string, memberId: string) {
    await this.get(orgId, projectId, memberId);
    return this.projectMembers.createQueryBuilder('pm')
      .innerJoin(OrganizationMember, 'member', 'member.id = pm.org_member_id')
      .innerJoin(User, 'user', 'user.id = member.user_id')
      .where('pm.project_id = :projectId AND member.org_id = :orgId', { projectId, orgId })
      .select('pm.id', 'id')
      .addSelect('pm.org_member_id', '"orgMemberId"')
      .addSelect('pm.status', 'status')
      .addSelect('pm.joined_at', '"joinedAt"')
      .addSelect('user.full_name', '"fullName"')
      .addSelect('user.email', 'email')
      .addSelect('user.avatar_url', '"avatarUrl"')
      .orderBy('user.full_name', 'ASC')
      .getRawMany();
  }

  async listComponents(orgId: string, projectId: string, memberId: string) { await this.get(orgId, projectId, memberId); return this.components.find({ where: { projectId, archivedAt: IsNull() }, order: { name: 'ASC' } }); }

  async createComponent(orgId: string, projectId: string, memberId: string, input: CreateComponentDto) {
    await this.get(orgId, projectId, memberId);
    if (input.leadMemberId && !await this.projectMembers.exists({ where: { projectId, orgMemberId: input.leadMemberId, status: 'active' } })) throw new NotFoundException('Component lead must be an active project member');
    return this.components.save(this.components.create({ projectId, name: input.name.trim(), description: input.description?.trim() ?? null, leadMemberId: input.leadMemberId ?? null, archivedAt: null }));
  }

  /** Issues outside an active sprint remain in the backlog; planned and closed
   * sprint assignments are retained as history but do not hide work here. */
  async backlog(orgId: string, projectId: string, memberId: string, pagination: PaginationDto) {
    const membership = await this.projectMembers.findOne({ where: { projectId, orgMemberId: memberId, status: 'active' } });
    if (!membership) throw new ForbiddenException('Project membership required');
    const query = this.issues.createQueryBuilder('issue')
      .leftJoin(Sprint, 'sprint', 'sprint.id = issue.sprint_id')
      .where('issue.org_id = :orgId AND issue.project_id = :projectId AND issue.deleted_at IS NULL', { orgId, projectId })
      .andWhere('(issue.sprint_id IS NULL OR sprint.state != :activeSprint)', { activeSprint: 'active' })
      .orderBy('issue.created_at', 'DESC');
    const result = await paginate(query, pagination);
    if (!result.data.length) return result;
    const assigneeIds = [...new Set(result.data.map((i: any) => i.assigneeMemberId).filter(Boolean))];
    const stateIds = [...new Set(result.data.map((i: any) => i.stateId).filter(Boolean))];
    const [states, members] = await Promise.all([
      stateIds.length ? this.dataSource.getRepository(WorkflowState).find({ where: { id: In(stateIds) } }) : Promise.resolve([]),
      assigneeIds.length
        ? this.orgMembers.createQueryBuilder('om')
            .innerJoin(User, 'user', 'user.id = om.user_id')
            .where('om.id IN (:...assigneeIds)', { assigneeIds })
            .select(['om.id AS id', 'user.id AS "userId"', 'user.full_name AS "fullName"', 'user.email AS email', 'user.avatar_url AS "avatarUrl"'])
            .getRawMany()
        : Promise.resolve([]),
    ]);
    const stateMap = new Map(states.map((s) => [s.id, s]));
    const memberMap = new Map(members.map((m) => [m.id, { id: m.id, userId: m.userId, fullName: m.fullName, email: m.email, avatarUrl: m.avatarUrl }]));
    result.data = result.data.map((issue: any) => {
      const assignee = issue.assigneeMemberId ? memberMap.get(issue.assigneeMemberId) || null : null;
      return {
        ...issue,
        state: stateMap.get(issue.stateId) || null,
        assignee,
        assigneeMember: assignee,
      };
    });
    return result;
  }

  async updateComponent(orgId: string, projectId: string, componentId: string, memberId: string, input: UpdateComponentDto) {
    await this.get(orgId, projectId, memberId);
    const component = await this.components.findOne({ where: { id: componentId, projectId, archivedAt: IsNull() } });
    if (!component) throw new NotFoundException('Component not found');
    if (input.leadMemberId && !await this.projectMembers.exists({ where: { projectId, orgMemberId: input.leadMemberId, status: 'active' } })) throw new NotFoundException('Component lead must be an active project member');
    component.name = input.name.trim();
    component.description = input.description?.trim() || null;
    component.leadMemberId = input.leadMemberId ?? null;
    return this.components.save(component);
  }

  async archiveComponent(orgId: string, projectId: string, componentId: string, memberId: string) { await this.get(orgId, projectId, memberId); const component = await this.components.findOne({ where: { id: componentId, projectId, archivedAt: IsNull() } }); if (!component) throw new NotFoundException('Component not found'); component.archivedAt = new Date(); return this.components.save(component); }

  async listVersions(orgId: string, projectId: string, memberId: string) { await this.get(orgId, projectId, memberId); return this.versions.find({ where: { projectId }, order: { releaseDate: 'ASC', name: 'ASC' } }); }

  async createVersion(orgId: string, projectId: string, memberId: string, input: CreateVersionDto) { await this.get(orgId, projectId, memberId); return this.versions.save(this.versions.create({ projectId, name: input.name.trim(), description: input.description?.trim() ?? null, releaseDate: input.releaseDate ? new Date(input.releaseDate) : null, status: 'unreleased', releasedAt: null })); }

  async updateVersion(orgId: string, projectId: string, versionId: string, memberId: string, input: UpdateVersionDto) {
    await this.get(orgId, projectId, memberId);
    const version = await this.versions.findOne({ where: { id: versionId, projectId } });
    if (!version || version.status === 'archived') throw new NotFoundException('Version not found');
    version.name = input.name.trim();
    version.description = input.description?.trim() || null;
    version.releaseDate = input.releaseDate ? new Date(input.releaseDate) : null;
    return this.versions.save(version);
  }

  async releaseVersion(orgId: string, projectId: string, versionId: string, memberId: string) { await this.get(orgId, projectId, memberId); const version = await this.versions.findOne({ where: { id: versionId, projectId } }); if (!version) throw new NotFoundException('Version not found'); version.status = 'released'; version.releasedAt = new Date(); return this.versions.save(version); }

  async archiveVersion(orgId: string, projectId: string, versionId: string, memberId: string) {
    await this.get(orgId, projectId, memberId);
    const version = await this.versions.findOne({ where: { id: versionId, projectId } });
    if (!version) throw new NotFoundException('Version not found');
    version.status = 'archived';
    return this.versions.save(version);
  }

  async addMember(orgId: string, projectId: string, actorMemberId: string, input: AddProjectMemberDto) {
    await this.get(orgId, projectId, actorMemberId);
    const orgMember = await this.orgMembers.findOne({ where: { id: input.orgMemberId, orgId, status: 'active' } });
    if (!orgMember) throw new NotFoundException('Organization member not found');
    return this.dataSource.transaction(async (manager) => {
      let membership = await manager.findOne(ProjectMember, { where: { projectId, orgMemberId: input.orgMemberId } });
      if (membership?.status === 'active') throw new ConflictException('Member is already in this project');
      membership = await manager.save(ProjectMember, manager.create(ProjectMember, { ...membership, projectId, orgMemberId: input.orgMemberId, status: 'active', joinedAt: new Date() }));
      const memberRole = await manager.findOne(ProjectRole, { where: { projectId, key: 'member' } });
      if (memberRole) {
        const existingRole = await manager.findOne(ProjectMemberRole, { where: { projectMemberId: membership.id, projectRoleId: memberRole.id } });
        if (!existingRole) await manager.save(ProjectMemberRole, manager.create(ProjectMemberRole, { projectMemberId: membership.id, projectRoleId: memberRole.id, grantedByMemberId: actorMemberId }));
      }
      return membership;
    });
  }

  async updateMemberStatus(orgId: string, projectId: string, actorMemberId: string, projectMemberId: string, status: 'active' | 'removed') {
    await this.get(orgId, projectId, actorMemberId);
    return this.dataSource.transaction(async (manager) => {
      const membership = await manager.findOne(ProjectMember, { where: { id: projectMemberId, projectId } });
      if (!membership) throw new NotFoundException('Project member not found');
      if (membership.orgMemberId === actorMemberId && status === 'removed') throw new ConflictException('You cannot remove your own project membership');
      if (status === 'removed') {
        const adminRole = await manager.findOne(ProjectRole, { where: { projectId, key: 'project-admin' } });
        if (adminRole) {
          const admins = await manager.createQueryBuilder(ProjectMemberRole, 'role')
            .innerJoin(ProjectMember, 'member', 'member.id = role.project_member_id AND member.status = :active', { active: 'active' })
            .where('member.project_id = :projectId AND role.project_role_id = :roleId', { projectId, roleId: adminRole.id })
            .getCount();
          const isAdmin = await manager.exists(ProjectMemberRole, { where: { projectMemberId: membership.id, projectRoleId: adminRole.id } });
          if (isAdmin && admins <= 1) throw new ConflictException('Cannot remove the last project administrator');
        }
      }
      membership.status = status;
      return manager.save(membership);
    });
  }

  async updateIssue(orgId: string, projectId: string, issueId: string, memberId: string, input: UpdateIssueDto) {
    const membership = await this.projectMembers.findOne({ where: { projectId, orgMemberId: memberId, status: 'active' } });
    if (!membership) throw new ForbiddenException('Project membership required');
    return this.dataSource.transaction(async (manager) => {
      const issue = await manager.findOne(Issue, { where: { id: issueId, orgId, projectId, deletedAt: IsNull() }, lock: { mode: 'pessimistic_write' } });
      if (!issue) throw new NotFoundException('Issue not found');
      if (Number(input.expectedVersion) !== issue.version) throw new ConflictException('Issue version is stale');
      if (input.summary !== undefined) issue.summary = input.summary.trim();
      if (input.description !== undefined) issue.description = input.description?.trim() || null;
      if (input.dueAt !== undefined) issue.dueAt = input.dueAt ? new Date(input.dueAt) : null;
      if (input.assigneeMemberId !== undefined) {
        if (input.assigneeMemberId) {
          const assignee = await manager.findOne(ProjectMember, { where: { projectId, orgMemberId: input.assigneeMemberId, status: 'active' } });
          if (!assignee) throw new ForbiddenException('Assignee must be an active project member');
        }
        issue.assigneeMemberId = input.assigneeMemberId || null;
      }
      if (input.sprintId !== undefined) {
        if (input.sprintId) {
          const sprint = await manager.findOne(Sprint, { where: { id: input.sprintId, projectId } });
          if (!sprint) throw new NotFoundException('Sprint not found');
        }
        issue.sprintId = input.sprintId || null;
      }
      if (input.parentIssueId !== undefined) {
        if (input.parentIssueId) {
          if (input.parentIssueId === issue.id) throw new ConflictException('Issue cannot be its own parent');
          const parent = await manager.findOne(Issue, { where: { id: input.parentIssueId, projectId } });
          if (!parent) throw new NotFoundException('Parent issue not found');
        }
        issue.parentIssueId = input.parentIssueId || null;
      }
      if (input.originalEstimateSeconds !== undefined) issue.originalEstimateSeconds = input.originalEstimateSeconds;
      if (input.remainingEstimateSeconds !== undefined) issue.remainingEstimateSeconds = input.remainingEstimateSeconds;
      if (input.priority !== undefined) issue.priority = input.priority;
      if (input.componentId !== undefined) issue.componentId = input.componentId || null;
      issue.version += 1;
      const saved = await manager.save(issue);
      const payload = { issueId: saved.id, issueKey: saved.key, projectId, updatedByMemberId: memberId, version: saved.version };
      await manager.save(ActivityLog, manager.create(ActivityLog, { orgId, actorType: 'member', actorMemberId: memberId, projectId, issueId: saved.id, eventType: EVENT_TYPES.ISSUE_UPDATED, payloadJson: payload }));
      await manager.save(OutboxEvent, manager.create(OutboxEvent, { orgId, aggregateType: 'issue', aggregateId: saved.id, eventType: EVENT_TYPES.ISSUE_UPDATED, payloadJson: payload, status: 'pending', idempotencyKey: `issue-updated:${saved.id}:${saved.version}`, publishedAt: null, retryCount: 0, lastError: null }));
      return saved;
    });
  }

  async deleteIssue(orgId: string, projectId: string, issueId: string, memberId: string) {
    const membership = await this.projectMembers.findOne({ where: { projectId, orgMemberId: memberId, status: 'active' } });
    if (!membership) throw new ForbiddenException('Project membership required');
    return this.dataSource.transaction(async (manager) => {
      const issue = await manager.findOne(Issue, { where: { id: issueId, orgId, projectId, deletedAt: IsNull() }, lock: { mode: 'pessimistic_write' } });
      if (!issue) throw new NotFoundException('Issue not found');
      issue.deletedAt = new Date();
      issue.version += 1;
      await manager.save(issue);
      await manager.delete(BoardIssuePosition, { issueId: issue.id });
      const payload = { issueId: issue.id, issueKey: issue.key, projectId, deletedByMemberId: memberId };
      await manager.save(ActivityLog, manager.create(ActivityLog, { orgId, actorType: 'member', actorMemberId: memberId, projectId, issueId: issue.id, eventType: EVENT_TYPES.ISSUE_DELETED, payloadJson: payload }));
      await manager.save(OutboxEvent, manager.create(OutboxEvent, { orgId, aggregateType: 'issue', aggregateId: issue.id, eventType: EVENT_TYPES.ISSUE_DELETED, payloadJson: payload, status: 'pending', idempotencyKey: `issue-deleted:${issue.id}`, publishedAt: null, retryCount: 0, lastError: null }));
      return { success: true, id: issue.id, key: issue.key, deletedAt: issue.deletedAt };
    });
  }

  async getProjectWorkflow(orgId: string, projectId: string, memberId: string) {
    const project = await this.get(orgId, projectId, memberId);
    const workflow = await this.dataSource.getRepository(Workflow).findOne({ where: { orgId, key: project.workflowKey ?? '', isActive: true } });
    const states = workflow ? await this.dataSource.getRepository(WorkflowState).find({ where: { workflowId: workflow.id }, order: { position: 'ASC' } }) : [];
    const transitions = workflow ? await this.dataSource.getRepository(WorkflowTransition).find({ where: { workflowId: workflow.id }, order: { sortOrder: 'ASC' } }) : [];
    return { project, workflow, states, transitions };
  }
}
