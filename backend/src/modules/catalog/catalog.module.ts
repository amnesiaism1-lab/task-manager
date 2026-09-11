import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IssueType } from '../../database/entities/issue/issue-type.entity';
import { Label } from '../../database/entities/issue/label.entity';
import { IssueLinkType } from '../../database/entities/issue/issue-link-type.entity';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { OrgPermissionGuard } from '../../common/guards/org-permission.guard';
import { PermissionModule } from '../permission/permission.module';
import { AuthModule } from '../auth/auth.module';
import { OrganizationMember } from '../../database/entities/identity/organization-member.entity';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';

@Module({ imports: [TypeOrmModule.forFeature([IssueType, Label, IssueLinkType, OrganizationMember]), PermissionModule, AuthModule], controllers: [CatalogController], providers: [CatalogService, OrgPermissionGuard, OrgMembershipGuard], exports: [CatalogService] })
export class CatalogModule {}
