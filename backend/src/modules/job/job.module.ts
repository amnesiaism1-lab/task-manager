import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackgroundJob } from '../../database/entities/audit/background-job.entity';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { OrganizationMember } from '../../database/entities/identity/organization-member.entity';
import { AuthModule } from '../auth/auth.module';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';

@Module({ imports: [TypeOrmModule.forFeature([BackgroundJob, OrganizationMember]), AuthModule], controllers: [JobController], providers: [JobService, OrgMembershipGuard], exports: [JobService] })
export class JobModule {}
