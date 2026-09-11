import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../../database/entities/identity/organization.entity';
import { OrganizationMember } from '../../database/entities/identity/organization-member.entity';
import { OrganizationInvitation } from '../../database/entities/identity/organization-invitation.entity';
import { OrganizationRole } from '../../database/entities/identity/organization-role.entity';
import { OrganizationMemberRole } from '../../database/entities/identity/org-member-role.entity';
import { OrganizationRolePermission } from '../../database/entities/identity/org-role-permission.entity';
import { Department } from '../../database/entities/identity/department.entity';
import { DepartmentMember } from '../../database/entities/identity/department-member.entity';
import { Group } from '../../database/entities/identity/group.entity';
import { GroupMember } from '../../database/entities/identity/group-member.entity';
import { User } from '../../database/entities/identity/user.entity';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { PermissionModule } from '../permission/permission.module';
import { AuthModule } from '../auth/auth.module';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { OrgPermissionGuard } from '../../common/guards/org-permission.guard';

import { MailModule } from '../mail/mail.module';

@Module({
	imports: [TypeOrmModule.forFeature([Organization, OrganizationMember, OrganizationInvitation, OrganizationRole, OrganizationMemberRole, OrganizationRolePermission, Department, DepartmentMember, Group, GroupMember, User]), PermissionModule, AuthModule, MailModule],
	controllers: [OrganizationController],
	providers: [OrganizationService, OrgMembershipGuard, OrgPermissionGuard],
})
export class OrganizationModule {}
