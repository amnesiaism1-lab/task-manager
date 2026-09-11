import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(__dirname, '../../../.env') });
dotenv.config({ path: join(__dirname, '../../../../.env') });

import { User } from '../entities/identity/user.entity';
import { Organization } from '../entities/identity/organization.entity';
import { OrganizationMember } from '../entities/identity/organization-member.entity';
import { OrganizationRole } from '../entities/identity/organization-role.entity';
import { OrganizationMemberRole } from '../entities/identity/org-member-role.entity';
import { OrganizationRolePermission } from '../entities/identity/org-role-permission.entity';
import { Department } from '../entities/identity/department.entity';
import { Group } from '../entities/identity/group.entity';
import { GroupMember } from '../entities/identity/group-member.entity';

import { Project } from '../entities/project/project.entity';
import { ProjectMember } from '../entities/project/project-member.entity';
import { ProjectRole } from '../entities/project/project-role.entity';
import { ProjectMemberRole } from '../entities/project/project-member-role.entity';
import { PermissionScheme } from '../entities/project/permission-scheme.entity';
import { PermissionSchemeEntry } from '../entities/project/permission-scheme-entry.entity';
import { Board } from '../entities/project/board.entity';
import { BoardColumn } from '../entities/project/board-column.entity';
import { Sprint } from '../entities/project/sprint.entity';
import { ProjectComponent } from '../entities/project/project-component.entity';
import { ProjectVersion } from '../entities/project/project-version.entity';
import { BoardIssuePosition } from '../entities/project/board-issue-position.entity';

import { Workflow } from '../entities/workflow/workflow.entity';
import { WorkflowState } from '../entities/workflow/workflow-state.entity';
import { WorkflowTransition } from '../entities/workflow/workflow-transition.entity';
import { BoardColumnState } from '../entities/workflow/board-column-state.entity';

import { IssueType } from '../entities/issue/issue-type.entity';
import { IssueLinkType } from '../entities/issue/issue-link-type.entity';
import { Issue } from '../entities/issue/issue.entity';
import { Comment } from '../entities/issue/comment.entity';
import { WorkLog } from '../entities/issue/work-log.entity';
import { Label } from '../entities/issue/label.entity';
import { IssueLabel } from '../entities/issue/issue-label.entity';

import { ORG_PERMISSIONS, PROJECT_PERMISSIONS } from '@task-manager/shared';

async function runSeed() {
  console.log('--- Starting Task Manager Database Seeder ---');

  const dbUrl = process.env.DATABASE_URL;
  const dbHost = process.env.DATABASE_HOST || 'localhost';
  const isSsl = process.env.DATABASE_SSL === 'true' ||
                (dbUrl && (dbUrl.includes('supabase') || dbUrl.includes('pooler'))) ||
                dbHost.includes('supabase');

  const dataSource = new DataSource({
    type: 'postgres',
    ...(dbUrl ? { url: dbUrl } : {
      host: dbHost,
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'dev',
      password: process.env.DATABASE_PASSWORD || 'dev_password',
      database: process.env.DATABASE_NAME || 'task_manager',
    }),
    ssl: isSsl ? { rejectUnauthorized: false } : false,
    entities: [join(__dirname, '../entities/**/*.entity.{ts,js}')],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('Database connection initialized successfully.');

  await dataSource.transaction(async (manager) => {
    // 1. Users
    const passwordHash = await bcrypt.hash('Admin@123456', 10);
    const devPasswordHash = await bcrypt.hash('Dev@123456', 10);

    let adminUser = await manager.findOne(User, { where: { email: 'admin@taskmanager.dev' } });
    if (!adminUser) {
      adminUser = await manager.save(User, manager.create(User, {
        email: 'admin@taskmanager.dev',
        passwordHash,
        fullName: 'System Administrator',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin',
        status: 'active',
        emailVerifiedAt: new Date(),
      }));
      console.log('Created Admin User: admin@taskmanager.dev');
    }

    let devUser = await manager.findOne(User, { where: { email: 'developer@taskmanager.dev' } });
    if (!devUser) {
      devUser = await manager.save(User, manager.create(User, {
        email: 'developer@taskmanager.dev',
        passwordHash: devPasswordHash,
        fullName: 'Alex Nguyen',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        status: 'active',
        emailVerifiedAt: new Date(),
      }));
      console.log('Created Dev User: developer@taskmanager.dev');
    }

    // 2. Organization
    let org = await manager.findOne(Organization, { where: { key: 'ACME' } });
    if (!org) {
      org = await manager.save(Organization, manager.create(Organization, {
        key: 'ACME',
        name: 'Acme Cloud Platform',
        status: 'active',
        plan: 'enterprise',
      }));
      console.log('Created Organization: ACME');
    }

    // 3. Org Roles & Members
    let orgAdminRole = await manager.findOne(OrganizationRole, { where: { orgId: org.id, key: 'org-admin' } });
    if (!orgAdminRole) {
      orgAdminRole = await manager.save(OrganizationRole, manager.create(OrganizationRole, {
        orgId: org.id,
        key: 'org-admin',
        name: 'Organization Administrator',
        description: 'Full administrative access to the organization',
      }));
      const allOrgPermissions = Object.keys(ORG_PERMISSIONS);
      await manager.save(OrganizationRolePermission, allOrgPermissions.map(permissionKey =>
        manager.create(OrganizationRolePermission, { roleId: orgAdminRole!.id, permissionKey })
      ));
    }

    let orgMemberRole = await manager.findOne(OrganizationRole, { where: { orgId: org.id, key: 'member' } });
    if (!orgMemberRole) {
      orgMemberRole = await manager.save(OrganizationRole, manager.create(OrganizationRole, {
        orgId: org.id,
        key: 'member',
        name: 'Member',
        description: 'Standard organization member',
      }));
      await manager.save(OrganizationRolePermission, [
        manager.create(OrganizationRolePermission, { roleId: orgMemberRole.id, permissionKey: 'CREATE_PROJECT' }),
      ]);
    }

    let adminMember = await manager.findOne(OrganizationMember, { where: { orgId: org.id, userId: adminUser.id } });
    if (!adminMember) {
      adminMember = await manager.save(OrganizationMember, manager.create(OrganizationMember, {
        orgId: org.id,
        userId: adminUser.id,
        status: 'active',
        joinedAt: new Date(),
      }));
      await manager.save(OrganizationMemberRole, manager.create(OrganizationMemberRole, {
        orgMemberId: adminMember.id,
        roleId: orgAdminRole.id,
      }));
    }

    let devMember = await manager.findOne(OrganizationMember, { where: { orgId: org.id, userId: devUser.id } });
    if (!devMember) {
      devMember = await manager.save(OrganizationMember, manager.create(OrganizationMember, {
        orgId: org.id,
        userId: devUser.id,
        status: 'active',
        joinedAt: new Date(),
      }));
      await manager.save(OrganizationMemberRole, manager.create(OrganizationMemberRole, {
        orgMemberId: devMember.id,
        roleId: orgMemberRole.id,
      }));
    }

    // 4. Department & Group
    let dept = await manager.findOne(Department, { where: { orgId: org.id, name: 'Engineering' } });
    if (!dept) {
      dept = await manager.save(Department, manager.create(Department, {
        orgId: org.id,
        name: 'Engineering',
      }));
    }

    let group = await manager.findOne(Group, { where: { orgId: org.id, name: 'Core Developers' } });
    if (!group) {
      group = await manager.save(Group, manager.create(Group, {
        orgId: org.id,
        name: 'Core Developers',
        description: 'Engineers maintaining core infrastructure',
      }));
      await manager.save(GroupMember, [
        manager.create(GroupMember, { groupId: group.id, orgMemberId: adminMember.id }),
        manager.create(GroupMember, { groupId: group.id, orgMemberId: devMember.id }),
      ]);
    }

    // 5. Issue Types & Link Types
    const typeKeys = [
      { key: 'epic', name: 'Epic', description: 'Large initiative' },
      { key: 'story', name: 'Story', description: 'User value deliverable' },
      { key: 'task', name: 'Task', description: 'Standard task' },
      { key: 'bug', name: 'Bug', description: 'Problem or defect' },
    ];
    for (const t of typeKeys) {
      const exists = await manager.findOne(IssueType, { where: { orgId: org.id, key: t.key } });
      if (!exists) {
        await manager.save(IssueType, manager.create(IssueType, { orgId: org.id, key: t.key, name: t.name, description: t.description }));
      }
    }

    const linkDefs = [
      { key: 'blocks', outwardLabel: 'blocks', inwardLabel: 'is blocked by', directionality: 'directed' as const },
      { key: 'relates', outwardLabel: 'relates to', inwardLabel: 'relates to', directionality: 'symmetric' as const },
      { key: 'duplicates', outwardLabel: 'duplicates', inwardLabel: 'is duplicated by', directionality: 'directed' as const },
    ];
    for (const l of linkDefs) {
      const exists = await manager.findOne(IssueLinkType, { where: { orgId: org.id, key: l.key } });
      if (!exists) {
        await manager.save(IssueLinkType, manager.create(IssueLinkType, { orgId: org.id, ...l }));
      }
    }

    // 6. Workflow & States
    let workflow = await manager.findOne(Workflow, { where: { orgId: org.id, key: 'cloud-default' } });
    if (!workflow) {
      workflow = await manager.save(Workflow, manager.create(Workflow, {
        orgId: org.id,
        key: 'cloud-default',
        name: 'Cloud Platform Workflow',
        version: 1,
        isActive: true,
      }));

      const todoState = await manager.save(WorkflowState, manager.create(WorkflowState, {
        workflowId: workflow.id, key: 'todo', name: 'To Do', category: 'todo', isInitial: true, isTerminal: false, position: 0
      }));
      const inProgressState = await manager.save(WorkflowState, manager.create(WorkflowState, {
        workflowId: workflow.id, key: 'in_progress', name: 'In Progress', category: 'in_progress', isInitial: false, isTerminal: false, position: 1
      }));
      const inReviewState = await manager.save(WorkflowState, manager.create(WorkflowState, {
        workflowId: workflow.id, key: 'in_review', name: 'In Review', category: 'in_progress', isInitial: false, isTerminal: false, position: 2
      }));
      const doneState = await manager.save(WorkflowState, manager.create(WorkflowState, {
        workflowId: workflow.id, key: 'done', name: 'Done', category: 'done', isInitial: false, isTerminal: true, position: 3
      }));

      // Transitions
      await manager.save(WorkflowTransition, [
        manager.create(WorkflowTransition, { workflowId: workflow.id, key: 'start', name: 'Start Work', fromStateId: todoState.id, toStateId: inProgressState.id, requireComment: false, sortOrder: 0 }),
        manager.create(WorkflowTransition, { workflowId: workflow.id, key: 'request_review', name: 'Submit Review', fromStateId: inProgressState.id, toStateId: inReviewState.id, requireComment: false, sortOrder: 1 }),
        manager.create(WorkflowTransition, { workflowId: workflow.id, key: 'approve', name: 'Approve & Complete', fromStateId: inReviewState.id, toStateId: doneState.id, requireComment: false, sortOrder: 2 }),
        manager.create(WorkflowTransition, { workflowId: workflow.id, key: 'reject_review', name: 'Changes Requested', fromStateId: inReviewState.id, toStateId: inProgressState.id, requireComment: true, sortOrder: 3 }),
        manager.create(WorkflowTransition, { workflowId: workflow.id, key: 'reopen', name: 'Reopen Issue', fromStateId: doneState.id, toStateId: todoState.id, requireComment: false, sortOrder: 4 }),
      ]);
    }

    // 7. Project "Cloud Platform" (CLOUD)
    let project = await manager.findOne(Project, { where: { orgId: org.id, key: 'CLOUD' } });
    if (!project) {
      project = await manager.save(Project, manager.create(Project, {
        orgId: org.id,
        key: 'CLOUD',
        name: 'Cloud Platform & Infrastructure',
        description: 'High-scale multi-tenant cloud services',
        visibility: 'org',
        createdByMemberId: adminMember.id,
        workflowKey: 'cloud-default',
        nextIssueNumber: 8,
        archivedAt: null,
      }));

      // Roles
      const projAdminRole = await manager.save(ProjectRole, manager.create(ProjectRole, {
        projectId: project.id, key: 'project-admin', name: 'Project Administrator', description: 'Admin access'
      }));
      const projMemberRole = await manager.save(ProjectRole, manager.create(ProjectRole, {
        projectId: project.id, key: 'member', name: 'Project Member', description: 'Standard project access'
      }));

      // Membership
      const pAdminMem = await manager.save(ProjectMember, manager.create(ProjectMember, {
        projectId: project.id, orgMemberId: adminMember.id, status: 'active', joinedAt: new Date()
      }));
      await manager.save(ProjectMemberRole, manager.create(ProjectMemberRole, {
        projectMemberId: pAdminMem.id, projectRoleId: projAdminRole.id, grantedByMemberId: adminMember.id
      }));

      const pDevMem = await manager.save(ProjectMember, manager.create(ProjectMember, {
        projectId: project.id, orgMemberId: devMember.id, status: 'active', joinedAt: new Date()
      }));
      await manager.save(ProjectMemberRole, manager.create(ProjectMemberRole, {
        projectMemberId: pDevMem.id, projectRoleId: projMemberRole.id, grantedByMemberId: adminMember.id
      }));

      // Permissions Scheme
      const scheme = await manager.save(PermissionScheme, manager.create(PermissionScheme, {
        projectId: project.id, name: 'Cloud Default Permission Scheme', description: 'Standard Agile permissions'
      }));
      project.permissionSchemeId = scheme.id;
      await manager.save(project);

      const allProjectPerms = Object.keys(PROJECT_PERMISSIONS);
      await manager.save(PermissionSchemeEntry, allProjectPerms.map(permissionKey =>
        manager.create(PermissionSchemeEntry, { schemeId: scheme.id, permissionKey, projectRoleId: projAdminRole.id })
      ));
      const devPerms = ['BROWSE_PROJECT', 'CREATE_ISSUE', 'EDIT_ISSUE', 'TRANSITION_ISSUE', 'ADD_COMMENT', 'LOG_WORK', 'LINK_ISSUE', 'ADD_ATTACHMENT', 'MANAGE_WATCHERS'];
      await manager.save(PermissionSchemeEntry, devPerms.map(permissionKey =>
        manager.create(PermissionSchemeEntry, { schemeId: scheme.id, permissionKey, projectRoleId: projMemberRole.id })
      ));

      // Board & Columns
      const board = await manager.save(Board, manager.create(Board, {
        projectId: project.id, boardType: 'scrum', name: 'Cloud Scrum Board', description: 'Primary engineering board'
      }));

      const states = await manager.find(WorkflowState, { where: { workflowId: workflow.id }, order: { position: 'ASC' } });
      const todoSt = states.find(s => s.key === 'todo')!;
      const progSt = states.find(s => s.key === 'in_progress')!;
      const revSt = states.find(s => s.key === 'in_review')!;
      const doneSt = states.find(s => s.key === 'done')!;

      const colTodo = await manager.save(BoardColumn, manager.create(BoardColumn, { boardId: board.id, name: 'To Do', position: 0, wipLimit: 10 }));
      const colProg = await manager.save(BoardColumn, manager.create(BoardColumn, { boardId: board.id, name: 'In Progress', position: 1, wipLimit: 5 }));
      const colRev = await manager.save(BoardColumn, manager.create(BoardColumn, { boardId: board.id, name: 'In Review', position: 2, wipLimit: 4 }));
      const colDone = await manager.save(BoardColumn, manager.create(BoardColumn, { boardId: board.id, name: 'Done', position: 3, wipLimit: null }));

      await manager.save(BoardColumnState, [
        manager.create(BoardColumnState, { boardColumnId: colTodo.id, workflowStateId: todoSt.id }),
        manager.create(BoardColumnState, { boardColumnId: colProg.id, workflowStateId: progSt.id }),
        manager.create(BoardColumnState, { boardColumnId: colRev.id, workflowStateId: revSt.id }),
        manager.create(BoardColumnState, { boardColumnId: colDone.id, workflowStateId: doneSt.id }),
      ]);

      // Components & Versions
      await manager.save(ProjectComponent, [
        manager.create(ProjectComponent, { projectId: project.id, name: 'API Gateway', description: 'Edge routing & auth proxies', leadMemberId: adminMember.id }),
        manager.create(ProjectComponent, { projectId: project.id, name: 'Workflow Engine', description: 'Finite state machine core', leadMemberId: devMember.id }),
        manager.create(ProjectComponent, { projectId: project.id, name: 'Web Dashboard', description: 'SPA Frontend interface' }),
      ]);

      await manager.save(ProjectVersion, [
        manager.create(ProjectVersion, { projectId: project.id, name: 'v1.0.0', description: 'Initial stable release', status: 'released', releasedAt: new Date(Date.now() - 14 * 86400000) }),
        manager.create(ProjectVersion, { projectId: project.id, name: 'v1.1.0', description: 'Agile sprints & metrics', status: 'unreleased', releaseDate: new Date(Date.now() + 14 * 86400000) }),
      ]);

      // Sprints
      const sprint1 = await manager.save(Sprint, manager.create(Sprint, {
        projectId: project.id, boardId: board.id, name: 'Sprint 1 — Core Foundation', goal: 'Launch initial state machine & API proxies', state: 'active', startAt: new Date(Date.now() - 5 * 86400000), endAt: new Date(Date.now() + 9 * 86400000)
      }));

      const sprint2 = await manager.save(Sprint, manager.create(Sprint, {
        projectId: project.id, boardId: board.id, name: 'Sprint 2 — Performance & Scale', goal: 'Implement caching layer and advanced JQL filter compilation', state: 'planned'
      }));

      // Labels
      const labelBackend = await manager.save(Label, manager.create(Label, { orgId: org.id, name: 'backend' }));
      const labelFrontend = await manager.save(Label, manager.create(Label, { orgId: org.id, name: 'frontend' }));
      const labelSecurity = await manager.save(Label, manager.create(Label, { orgId: org.id, name: 'security' }));

      // Sample Issues
      const taskType = await manager.findOne(IssueType, { where: { orgId: org.id, key: 'task' } });
      const bugType = await manager.findOne(IssueType, { where: { orgId: org.id, key: 'bug' } });
      const storyType = await manager.findOne(IssueType, { where: { orgId: org.id, key: 'story' } });

      const sampleIssuesData = [
        {
          key: 'CLOUD-1', summary: 'Setup PostgreSQL schema migrations & seed pipelines', description: 'Establish idempotent baseline migrations for all 70 entities.',
          stateId: doneSt.id, issueTypeId: taskType!.id, assigneeMemberId: adminMember.id, sprintId: sprint1.id, originalEstimateSeconds: 28800, timeSpentSeconds: 28800, resolvedAt: new Date()
        },
        {
          key: 'CLOUD-2', summary: 'Design JWT authentication & session revocation policy', description: 'Implement token signing, cookie storage and anti-enumeration checks.',
          stateId: revSt.id, issueTypeId: storyType!.id, assigneeMemberId: devMember.id, sprintId: sprint1.id, originalEstimateSeconds: 43200, timeSpentSeconds: 32400
        },
        {
          key: 'CLOUD-3', summary: 'Build dynamic Kanban board with column WIP limits', description: 'Create an interactive board with column reordering and visual warnings.',
          stateId: progSt.id, issueTypeId: storyType!.id, assigneeMemberId: devMember.id, sprintId: sprint1.id, originalEstimateSeconds: 57600, timeSpentSeconds: 28800
        },
        {
          key: 'CLOUD-4', summary: 'Implement work logs and time tracking calculation', description: 'Support time logs with remaining estimate automatic subtraction.',
          stateId: todoSt.id, issueTypeId: taskType!.id, assigneeMemberId: adminMember.id, sprintId: sprint1.id, originalEstimateSeconds: 21600, timeSpentSeconds: 0
        },
        {
          key: 'CLOUD-5', summary: 'Fix race condition during concurrent state transitions', description: 'Version stale conflict 409 should safely rollback and notify user.',
          stateId: todoSt.id, issueTypeId: bugType!.id, assigneeMemberId: null, sprintId: sprint2.id, originalEstimateSeconds: 14400, timeSpentSeconds: 0
        },
        {
          key: 'CLOUD-6', summary: 'Advanced query language AST compiler with security levels', description: 'Ensure user cannot query hidden fields or cross-tenant records.',
          stateId: todoSt.id, issueTypeId: storyType!.id, assigneeMemberId: null, sprintId: null, originalEstimateSeconds: 72000, timeSpentSeconds: 0
        },
        {
          key: 'CLOUD-7', summary: 'Automated webhook delivery with HMAC SHA256 signing', description: 'Dispatch outbox events with exponential backoff retries.',
          stateId: todoSt.id, issueTypeId: taskType!.id, assigneeMemberId: null, sprintId: null, originalEstimateSeconds: 36000, timeSpentSeconds: 0
        }
      ];

      for (let i = 0; i < sampleIssuesData.length; i++) {
        const d = sampleIssuesData[i];
        const iss = await manager.save(Issue, manager.create(Issue, {
          orgId: org.id,
          projectId: project.id,
          workflowId: workflow.id,
          reporterMemberId: adminMember.id,
          version: 1,
          ...d
        }));

        await manager.save(BoardIssuePosition, manager.create(BoardIssuePosition, {
          boardId: board.id, issueId: iss.id, rank: `0|${String(i).padStart(6, '0')}:`
        }));

        // Add some comments and work logs
        if (i === 1) {
          await manager.save(Comment, manager.create(Comment, {
            orgId: org.id, issueId: iss.id, authorMemberId: adminMember.id, body: 'Code looks solid. Ensure refresh token cookie has httpOnly and SameSite=Strict flags set.', bodyFormat: 'plain'
          }));
          await manager.save(WorkLog, manager.create(WorkLog, {
            issueId: iss.id, authorMemberId: devMember.id, timeSpentSeconds: 14400, startedAt: new Date(Date.now() - 86400000), comment: 'Initial token logic implemented.'
          }));
          await manager.save(IssueLabel, manager.create(IssueLabel, { issueId: iss.id, labelId: labelSecurity.id, addedByMemberId: adminMember.id }));
        }

        if (i === 2) {
          await manager.save(Comment, manager.create(Comment, {
            orgId: org.id, issueId: iss.id, authorMemberId: devMember.id, body: 'UI columns and card layouts are working smoothly.', bodyFormat: 'plain'
          }));
          await manager.save(IssueLabel, manager.create(IssueLabel, { issueId: iss.id, labelId: labelFrontend.id, addedByMemberId: devMember.id }));
        }
      }

      console.log('Project "CLOUD" seeded with 7 realistic issues, 2 sprints, board columns and worklogs!');
    }

    console.log('--- Database Seeding Completed Successfully! ---');
  });

  await dataSource.destroy();
}

runSeed().catch((err) => {
  console.error('Seeder failed with error:', err);
  process.exit(1);
});
