import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilterShare } from '../../database/entities/issue/filter-share.entity';
import { FilterSubscription } from '../../database/entities/issue/filter-subscription.entity';
import { SavedFilter } from '../../database/entities/issue/saved-filter.entity';
import { SavedFilterController } from './saved-filter.controller';
import { SavedFilterService } from './saved-filter.service';
import { OrganizationMember } from '../../database/entities/identity/organization-member.entity';
import { AuthModule } from '../auth/auth.module';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { Issue } from '../../database/entities/issue/issue.entity';
import { ProjectMember } from '../../database/entities/project/project-member.entity';
import { WorkflowState } from '../../database/entities/workflow/workflow-state.entity';
import { IssueSearchController } from './issue-search.controller';
import { IssueSearchService } from './issue-search.service';
import { IssueModule } from '../issue/issue.module';
import { PermissionModule } from '../permission/permission.module';

/** Search owns query parsing, saved views, sharing and subscriptions. */
@Module({
  imports: [
    TypeOrmModule.forFeature([SavedFilter, FilterShare, FilterSubscription, OrganizationMember, Issue, ProjectMember, WorkflowState]),
    AuthModule,
    IssueModule,
    PermissionModule,
  ],
  controllers: [SavedFilterController, IssueSearchController],
  providers: [SavedFilterService, IssueSearchService, OrgMembershipGuard],
})
export class SearchModule {}
