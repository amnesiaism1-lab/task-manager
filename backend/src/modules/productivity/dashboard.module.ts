import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dashboard } from '../../database/entities/productivity/dashboard.entity';
import { DashboardShare } from '../../database/entities/productivity/dashboard-share.entity';
import { DashboardWidget } from '../../database/entities/productivity/dashboard-widget.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { OrganizationMember } from '../../database/entities/identity/organization-member.entity';
import { AuthModule } from '../auth/auth.module';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';

@Module({ imports: [TypeOrmModule.forFeature([Dashboard, DashboardShare, DashboardWidget, OrganizationMember]), AuthModule], controllers: [DashboardController], providers: [DashboardService, OrgMembershipGuard] })
export class DashboardModule {}