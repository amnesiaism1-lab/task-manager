import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomField } from '../../database/entities/custom-field/custom-field.entity';
import { CustomFieldContext } from '../../database/entities/custom-field/custom-field-context.entity';
import { CustomFieldOption } from '../../database/entities/custom-field/custom-field-option.entity';
import { IssueCustomFieldValue } from '../../database/entities/custom-field/issue-custom-field-value.entity';
import { Issue } from '../../database/entities/issue/issue.entity';
import { ProjectMember } from '../../database/entities/project/project-member.entity';
import { OrganizationMember } from '../../database/entities/identity/organization-member.entity';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { OrgPermissionGuard } from '../../common/guards/org-permission.guard';
import { PermissionModule } from '../permission/permission.module';
import { AuthModule } from '../auth/auth.module';
import { CustomFieldController } from './custom-field.controller';
import { CustomFieldService } from './custom-field.service';
import { IssueModule } from '../issue/issue.module';
import { ActivityLog } from '../../database/entities/audit/activity-log.entity';
import { OutboxEvent } from '../../database/entities/audit/outbox-event.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			CustomField,
			CustomFieldContext,
			CustomFieldOption,
			IssueCustomFieldValue,
			Issue,
			ProjectMember,
			OrganizationMember,
			ActivityLog,
			OutboxEvent,
		]),
		PermissionModule,
		AuthModule,
		IssueModule,
	],
	controllers: [CustomFieldController],
	providers: [CustomFieldService, OrgMembershipGuard, OrgPermissionGuard],
})
export class CustomFieldModule {}
