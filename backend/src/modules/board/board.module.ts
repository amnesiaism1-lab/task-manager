import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../../database/entities/project/board.entity';
import { BoardColumn } from '../../database/entities/project/board-column.entity';
import { BoardIssuePosition } from '../../database/entities/project/board-issue-position.entity';
import { Issue } from '../../database/entities/issue/issue.entity';
import { OrganizationMember } from '../../database/entities/identity/organization-member.entity';
import { BoardColumnState } from '../../database/entities/workflow/board-column-state.entity';
import { WorkflowState } from '../../database/entities/workflow/workflow-state.entity';
import { Project } from '../../database/entities/project/project.entity';
import { Workflow } from '../../database/entities/workflow/workflow.entity';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { ProjectPermissionGuard } from '../../common/guards/project-permission.guard';
import { PermissionModule } from '../permission/permission.module';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [TypeOrmModule.forFeature([Board, BoardColumn, BoardIssuePosition, Issue, OrganizationMember, BoardColumnState, WorkflowState, Project, Workflow]), PermissionModule, AuthModule],
	controllers: [BoardController],
	providers: [BoardService, OrgMembershipGuard, ProjectPermissionGuard],
})
export class BoardModule {}
