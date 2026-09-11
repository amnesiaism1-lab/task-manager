import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLog } from '../../database/entities/audit/activity-log.entity';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { OrganizationMember } from '../../database/entities/identity/organization-member.entity';
import { AuthModule } from '../auth/auth.module';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';

@Module({ imports: [TypeOrmModule.forFeature([ActivityLog, OrganizationMember]), AuthModule], controllers: [AuditController], providers: [AuditService, OrgMembershipGuard], exports: [AuditService] })
export class AuditModule {}
