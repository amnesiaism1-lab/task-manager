import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from '../../database/entities/audit/activity-log.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/pagination.util';

@Injectable()
export class AuditService {
  constructor(@InjectRepository(ActivityLog) private readonly logs: Repository<ActivityLog>) {}

  search(orgId: string, input: PaginationDto & { projectId?: string; issueId?: string; eventType?: string; actorMemberId?: string }) {
    const query = this.logs.createQueryBuilder('log').where('log.org_id = :orgId', { orgId });
    if (input.projectId) query.andWhere('log.project_id = :projectId', { projectId: input.projectId });
    if (input.issueId) query.andWhere('log.issue_id = :issueId', { issueId: input.issueId });
    if (input.eventType) query.andWhere('log.event_type = :eventType', { eventType: input.eventType });
    if (input.actorMemberId) query.andWhere('log.actor_member_id = :actorMemberId', { actorMemberId: input.actorMemberId });
    return paginate(query.orderBy('log.created_at', input.sortOrder ?? 'DESC'), input);
  }
}