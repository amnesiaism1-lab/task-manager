import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dashboard } from '../../database/entities/productivity/dashboard.entity';
import { DashboardShare } from '../../database/entities/productivity/dashboard-share.entity';
import { DashboardWidget } from '../../database/entities/productivity/dashboard-widget.entity';

const WIDGETS = new Set(['issue-count', 'status-breakdown', 'my-work', 'sprint-progress']);

@Injectable()
export class DashboardService {
  constructor(@InjectRepository(Dashboard) private readonly dashboards: Repository<Dashboard>, @InjectRepository(DashboardShare) private readonly shares: Repository<DashboardShare>, @InjectRepository(DashboardWidget) private readonly widgets: Repository<DashboardWidget>) {}
  list(orgId: string, ownerMemberId: string) { return this.dashboards.find({ where: { orgId, ownerMemberId, status: 'active' }, order: { updatedAt: 'DESC' } }); }
  create(orgId: string, memberId: string, input: { name: string; description?: string }) { return this.dashboards.save(this.dashboards.create({ orgId, ownerMemberId: memberId, name: input.name.trim(), description: input.description?.trim() ?? null, status: 'active', version: 1 })); }
  async getOwned(orgId: string, memberId: string, id: string) { const dashboard = await this.dashboards.findOne({ where: { id, orgId, ownerMemberId: memberId, status: 'active' } }); if (!dashboard) throw new NotFoundException('Dashboard not found'); return dashboard; }
  async addWidget(orgId: string, memberId: string, id: string, input: { widgetType: string; savedFilterId?: string; configJson?: Record<string, unknown>; position?: number }) { await this.getOwned(orgId, memberId, id); if (!WIDGETS.has(input.widgetType)) throw new ConflictException('Widget type is invalid'); return this.widgets.save(this.widgets.create({ dashboardId: id, widgetType: input.widgetType, savedFilterId: input.savedFilterId ?? null, configJson: input.configJson ?? {}, position: input.position ?? 0, version: 1 })); }
  async getWidgets(orgId: string, memberId: string, id: string) { await this.getOwned(orgId, memberId, id); return this.widgets.find({ where: { dashboardId: id }, order: { position: 'ASC' } }); }
  async share(orgId: string, memberId: string, id: string, input: { granteeType: string; orgMemberId?: string; projectId?: string; canEdit?: boolean }) { await this.getOwned(orgId, memberId, id); if (!['member', 'project', 'organization'].includes(input.granteeType)) throw new ConflictException('Share target is invalid'); return this.shares.save(this.shares.create({ dashboardId: id, granteeType: input.granteeType, orgMemberId: input.orgMemberId ?? null, projectId: input.projectId ?? null, canEdit: input.canEdit ?? false })); }
}