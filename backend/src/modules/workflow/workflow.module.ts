import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workflow } from '../../database/entities/workflow/workflow.entity';
import { WorkflowState } from '../../database/entities/workflow/workflow-state.entity';
import { WorkflowTransition } from '../../database/entities/workflow/workflow-transition.entity';
import { WorkflowTransitionGuard } from '../../database/entities/workflow/workflow-transition-guard.entity';
import { OrganizationMember } from '../../database/entities/identity/organization-member.entity';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { OrgPermissionGuard } from '../../common/guards/org-permission.guard';
import { PermissionModule } from '../permission/permission.module';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [TypeOrmModule.forFeature([Workflow, WorkflowState, WorkflowTransition, WorkflowTransitionGuard, OrganizationMember]), PermissionModule, AuthModule],
	controllers: [WorkflowController],
	providers: [WorkflowService, OrgMembershipGuard, OrgPermissionGuard],
})
export class WorkflowModule {}
