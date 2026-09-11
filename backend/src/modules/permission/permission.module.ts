import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationMemberRole } from '../../database/entities/identity/org-member-role.entity';
import { OrganizationRolePermission } from '../../database/entities/identity/org-role-permission.entity';
import { GroupMember } from '../../database/entities/identity/group-member.entity';
import { ProjectMember } from '../../database/entities/project/project-member.entity';
import { ProjectMemberRole } from '../../database/entities/project/project-member-role.entity';
import { ProjectGroupRole } from '../../database/entities/project/project-group-role.entity';
import { ProjectRole } from '../../database/entities/project/project-role.entity';
import { PermissionScheme } from '../../database/entities/project/permission-scheme.entity';
import { PermissionSchemeEntry } from '../../database/entities/project/permission-scheme-entry.entity';
import { Project } from '../../database/entities/project/project.entity';
import { PermissionResolverService } from './permission-resolver.service';

@Module({ imports: [TypeOrmModule.forFeature([OrganizationMemberRole, OrganizationRolePermission, GroupMember, ProjectMember, ProjectMemberRole, ProjectGroupRole, ProjectRole, PermissionScheme, PermissionSchemeEntry, Project])], providers: [PermissionResolverService], exports: [PermissionResolverService] })
export class PermissionModule {}
