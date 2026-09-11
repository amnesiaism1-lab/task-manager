import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { FilterShare } from '../../database/entities/issue/filter-share.entity';
import { FilterSubscription } from '../../database/entities/issue/filter-subscription.entity';
import { SavedFilter } from '../../database/entities/issue/saved-filter.entity';

@Injectable()
export class SavedFilterService {
  constructor(
    @InjectRepository(SavedFilter) private readonly filters: Repository<SavedFilter>,
    @InjectRepository(FilterShare) private readonly shares: Repository<FilterShare>,
    @InjectRepository(FilterSubscription) private readonly subscriptions: Repository<FilterSubscription>,
  ) {}

  list(orgId: string, memberId: string) { return this.filters.find({ where: [{ orgId, ownerMemberId: memberId, archivedAt: IsNull() }], order: { updatedAt: 'DESC' } }); }

  async create(orgId: string, memberId: string, input: { name: string; description?: string; queryText: string }) {
    let parsed: unknown;
    try { parsed = JSON.parse(input.queryText); } catch { throw new ConflictException('Saved filter query must be valid JSON AST'); }
    if (!parsed || typeof parsed !== 'object') throw new ConflictException('Saved filter query must be an AST object');
    return this.filters.save(this.filters.create({ orgId, ownerMemberId: memberId, name: input.name.trim(), description: input.description?.trim() ?? null, queryLanguage: 'ast-json', queryText: input.queryText, version: 1, archivedAt: null }));
  }

  async get(orgId: string, id: string, memberId: string) {
    const filter = await this.filters.findOne({ where: { id, orgId, archivedAt: IsNull() } });
    if (!filter) throw new NotFoundException('Saved filter not found');
    const shared = filter.ownerMemberId === memberId || await this.shares.findOne({ where: { filterId: id, orgMemberId: memberId } });
    if (!shared) throw new NotFoundException('Saved filter not found');
    return filter;
  }

  async share(orgId: string, filterId: string, memberId: string, input: { granteeType: string; orgMemberId?: string; projectId?: string; groupId?: string; projectRoleKey?: string; canEdit?: boolean }) {
    const filter = await this.get(orgId, filterId, memberId);
    if (filter.ownerMemberId !== memberId) throw new NotFoundException('Saved filter not found');
    return this.shares.save(this.shares.create({ filterId, granteeType: input.granteeType, orgMemberId: input.orgMemberId ?? null, projectId: input.projectId ?? null, groupId: input.groupId ?? null, projectRoleKey: input.projectRoleKey ?? null, canEdit: input.canEdit ?? false }));
  }

  async subscribe(orgId: string, filterId: string, memberId: string, input: { cronExpression: string; timezone?: string }) {
    await this.get(orgId, filterId, memberId);
    return this.subscriptions.save(this.subscriptions.create({ filterId, subscriberMemberId: memberId, cronExpression: input.cronExpression, timezone: input.timezone ?? 'UTC', isActive: true, nextRunAt: null, lastRunAt: null }));
  }
}