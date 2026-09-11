import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomationComponent } from '../../database/entities/automation/automation-component.entity';
import { AutomationExecution } from '../../database/entities/automation/automation-execution.entity';
import { AutomationRule } from '../../database/entities/automation/automation-rule.entity';
import { AutomationController } from './automation.controller';
import { AutomationService } from './automation.service';
import { PermissionModule } from '../permission/permission.module';
import { OrgPermissionGuard } from '../../common/guards/org-permission.guard';
import { AuthModule } from '../auth/auth.module';
import { OrganizationMember } from '../../database/entities/identity/organization-member.entity';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';

@Module({ imports: [TypeOrmModule.forFeature([AutomationRule, AutomationComponent, AutomationExecution, OrganizationMember]), PermissionModule, AuthModule], controllers: [AutomationController], providers: [AutomationService, OrgPermissionGuard, OrgMembershipGuard] })
export class AutomationModule {}
