import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entities/identity/user.entity';
import { Organization } from '../../database/entities/identity/organization.entity';
import { OrganizationMember } from '../../database/entities/identity/organization-member.entity';
import { Project } from '../../database/entities/project/project.entity';
import { Notification } from '../../database/entities/audit/notification.entity';
import { Issue } from '../../database/entities/issue/issue.entity';
import { WorkflowState } from '../../database/entities/workflow/workflow-state.entity';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Organization,
      OrganizationMember,
      Project,
      Notification,
      Issue,
      WorkflowState,
    ]),
  ],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
