import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from '../../database/entities/issue/issue.entity';
import { Comment } from '../../database/entities/issue/comment.entity';
import { WorkLog } from '../../database/entities/issue/work-log.entity';
import { ProjectMember } from '../../database/entities/project/project-member.entity';
import { OrganizationMember } from '../../database/entities/identity/organization-member.entity';
import { Label } from '../../database/entities/issue/label.entity';
import { IssueLabel } from '../../database/entities/issue/issue-label.entity';
import { IssueWatcher } from '../../database/entities/issue/issue-watcher.entity';
import { IssueLinkType } from '../../database/entities/issue/issue-link-type.entity';
import { IssueLink } from '../../database/entities/issue/issue-link.entity';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { IssuePermissionGuard } from '../../common/guards/issue-permission.guard';
import { IssueController } from './issue.controller';
import { IssueService } from './issue.service';
import { AuthModule } from '../auth/auth.module';
import { Attachment } from '../../database/entities/issue/attachment.entity';
import { AttachmentController } from './attachment.controller';
import { AttachmentService } from './attachment.service';
import { StorageModule } from '../storage/storage.module';
import { Project } from '../../database/entities/project/project.entity';
import { IssueSecurityScheme } from '../../database/entities/issue/issue-security-scheme.entity';
import { IssueSecurityLevel } from '../../database/entities/issue/issue-security-level.entity';
import { IssueSecurityGrant } from '../../database/entities/issue/issue-security-grant.entity';
import { IssueAccessService } from './issue-access.service';
import { WorkflowState } from '../../database/entities/workflow/workflow-state.entity';
import { WorkflowTransition } from '../../database/entities/workflow/workflow-transition.entity';
import { WorkflowTransitionGuard } from '../../database/entities/workflow/workflow-transition-guard.entity';
import { IssueStateHistory } from '../../database/entities/issue/issue-state-history.entity';
import { IssueType } from '../../database/entities/issue/issue-type.entity';
import { PermissionModule } from '../permission/permission.module';
import { ProjectComponent } from '../../database/entities/project/project-component.entity';
import { ProjectVersion } from '../../database/entities/project/project-version.entity';
import { CustomFieldContext } from '../../database/entities/custom-field/custom-field-context.entity';
import { CustomField } from '../../database/entities/custom-field/custom-field.entity';
import { CustomFieldOption } from '../../database/entities/custom-field/custom-field-option.entity';
import { IssueCustomFieldValue } from '../../database/entities/custom-field/issue-custom-field-value.entity';
import { ActivityLog } from '../../database/entities/audit/activity-log.entity';
import { OutboxEvent } from '../../database/entities/audit/outbox-event.entity';
import { IssueSprintHistory } from '../../database/entities/issue/issue-sprint-history.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Issue,
			IssueSprintHistory,
			Comment,
			WorkLog,
			ProjectMember,
			OrganizationMember,
			Label,
			IssueLabel,
			IssueWatcher,
			IssueLinkType,
			IssueLink,
			Attachment,
			Project,
			IssueSecurityScheme,
			IssueSecurityLevel,
			IssueSecurityGrant,
			WorkflowState,
			WorkflowTransition,
			WorkflowTransitionGuard,
			IssueStateHistory,
			IssueType,
			ProjectComponent,
			ProjectVersion,
			CustomFieldContext,
			CustomField,
			CustomFieldOption,
			IssueCustomFieldValue,
			ActivityLog,
			OutboxEvent,
		]),
		AuthModule,
		StorageModule,
		PermissionModule,
	],
	controllers: [IssueController, AttachmentController],
	providers: [IssueService, AttachmentService, IssueAccessService, OrgMembershipGuard, IssuePermissionGuard],
	exports: [IssueAccessService, IssuePermissionGuard],
})
export class IssueModule {}
