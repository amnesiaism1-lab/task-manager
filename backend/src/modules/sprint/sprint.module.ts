import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../../database/entities/project/board.entity';
import { Sprint } from '../../database/entities/project/sprint.entity';
import { Issue } from '../../database/entities/issue/issue.entity';
import { IssueSprintHistory } from '../../database/entities/issue/issue-sprint-history.entity';
import { Project } from '../../database/entities/project/project.entity';
import { OrganizationMember } from '../../database/entities/identity/organization-member.entity';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { ProjectPermissionGuard } from '../../common/guards/project-permission.guard';
import { PermissionModule } from '../permission/permission.module';
import { AuthModule } from '../auth/auth.module';
import { SprintController } from './sprint.controller';
import { SprintService } from './sprint.service';

import { WorkflowState } from '../../database/entities/workflow/workflow-state.entity';
import { ActivityLog } from '../../database/entities/audit/activity-log.entity';
import { OutboxEvent } from '../../database/entities/audit/outbox-event.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Board, Sprint, Issue, IssueSprintHistory, Project, OrganizationMember, WorkflowState, ActivityLog, OutboxEvent]), PermissionModule, AuthModule],
	controllers: [SprintController],
	providers: [SprintService, OrgMembershipGuard, ProjectPermissionGuard],
})
export class SprintModule {}
