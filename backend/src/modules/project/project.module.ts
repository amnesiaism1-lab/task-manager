import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../../database/entities/project/project.entity';
import { ProjectRole } from '../../database/entities/project/project-role.entity';
import { ProjectMember } from '../../database/entities/project/project-member.entity';
import { ProjectMemberRole } from '../../database/entities/project/project-member-role.entity';
import { ProjectGroupRole } from '../../database/entities/project/project-group-role.entity';
import { ProjectComponent } from '../../database/entities/project/project-component.entity';
import { ProjectVersion } from '../../database/entities/project/project-version.entity';
import { PermissionScheme } from '../../database/entities/project/permission-scheme.entity';
import { PermissionSchemeEntry } from '../../database/entities/project/permission-scheme-entry.entity';
import { Board } from '../../database/entities/project/board.entity';
import { BoardColumn } from '../../database/entities/project/board-column.entity';
import { BoardColumnState } from '../../database/entities/workflow/board-column-state.entity';
import { OrganizationMember } from '../../database/entities/identity/organization-member.entity';
import { Group } from '../../database/entities/identity/group.entity';
import { User } from '../../database/entities/identity/user.entity';
import { BoardIssuePosition } from '../../database/entities/project/board-issue-position.entity';
import { Sprint } from '../../database/entities/project/sprint.entity';
import { Workflow } from '../../database/entities/workflow/workflow.entity';
import { WorkflowState } from '../../database/entities/workflow/workflow-state.entity';
import { WorkflowTransition } from '../../database/entities/workflow/workflow-transition.entity';
import { WorkflowTransitionGuard } from '../../database/entities/workflow/workflow-transition-guard.entity';
import { IssueType } from '../../database/entities/issue/issue-type.entity';
import { Issue } from '../../database/entities/issue/issue.entity';
import { IssueStateHistory } from '../../database/entities/issue/issue-state-history.entity';
import { Comment } from '../../database/entities/issue/comment.entity';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { OrgPermissionGuard } from '../../common/guards/org-permission.guard';
import { PermissionModule } from '../permission/permission.module';
import { ProjectPermissionGuard } from '../../common/guards/project-permission.guard';
import { ActivityLog } from '../../database/entities/audit/activity-log.entity';
import { OutboxEvent } from '../../database/entities/audit/outbox-event.entity';
import { OutboxModule } from '../outbox/outbox.module';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [TypeOrmModule.forFeature([Project, ProjectRole, ProjectMember, ProjectMemberRole, ProjectGroupRole, ProjectComponent, ProjectVersion, PermissionScheme, PermissionSchemeEntry, Board, BoardColumn, BoardColumnState, OrganizationMember, Group, User, BoardIssuePosition, Sprint, Workflow, WorkflowState, WorkflowTransition, WorkflowTransitionGuard, IssueType, Issue, IssueStateHistory, Comment, ActivityLog, OutboxEvent]), PermissionModule, OutboxModule, AuthModule],
	controllers: [ProjectController],
	providers: [ProjectService, OrgMembershipGuard, OrgPermissionGuard, ProjectPermissionGuard],
})
export class ProjectModule {}
