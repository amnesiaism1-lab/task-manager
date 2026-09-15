import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { IssueType } from '../../database/entities/issue/issue-type.entity';
import { Label } from '../../database/entities/issue/label.entity';
import { IssueLinkType } from '../../database/entities/issue/issue-link-type.entity';
import { Priority } from '../../database/entities/issue/priority.entity';
import { Resolution } from '../../database/entities/issue/resolution.entity';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(IssueType) private readonly types: Repository<IssueType>,
    @InjectRepository(Label) private readonly labels: Repository<Label>,
    @InjectRepository(IssueLinkType) private readonly links: Repository<IssueLinkType>,
    @InjectRepository(Priority) private readonly priorities: Repository<Priority>,
    @InjectRepository(Resolution) private readonly resolutions: Repository<Resolution>,
  ) {}

  listTypes(orgId: string) { return this.types.find({ where: { orgId }, order: { key: 'ASC' } }); }
  async createType(orgId: string, body: { key: string; name: string; description?: string }) { if (!body.key?.trim() || !body.name?.trim()) throw new ConflictException('Issue type key and name are required'); return this.types.save(this.types.create({ orgId, key: body.key.trim().toLowerCase(), name: body.name.trim(), description: body.description?.trim() ?? null })); }

  listLabels(orgId: string) { return this.labels.find({ where: { orgId, archivedAt: IsNull() }, order: { name: 'ASC' } }); }
  async archiveLabel(orgId: string, id: string) { const label = await this.labels.findOne({ where: { id, orgId, archivedAt: IsNull() } }); if (!label) throw new NotFoundException('Label not found'); label.archivedAt = new Date(); return this.labels.save(label); }

  listLinkTypes(orgId: string) { return this.links.find({ where: { orgId, archivedAt: IsNull() }, order: { key: 'ASC' } }); }
  async createLinkType(orgId: string, body: { key: string; outwardLabel: string; inwardLabel: string; directionality?: 'directed' | 'symmetric' }) { if (!['directed', 'symmetric'].includes(body.directionality ?? 'directed')) throw new ConflictException('Directionality is invalid'); return this.links.save(this.links.create({ orgId, key: body.key.trim().toLowerCase(), outwardLabel: body.outwardLabel.trim(), inwardLabel: body.inwardLabel.trim(), directionality: body.directionality ?? 'directed', archivedAt: null })); }
  async archiveLinkType(orgId: string, id: string) { const link = await this.links.findOne({ where: { id, orgId, archivedAt: IsNull() } }); if (!link) throw new NotFoundException('Link type not found'); link.archivedAt = new Date(); return this.links.save(link); }

  // Priorities
  listPriorities(orgId: string) { return this.priorities.find({ where: { orgId }, order: { orderNum: 'ASC' } }); }
  async createPriority(orgId: string, body: { key: string; name: string; color?: string; orderNum?: number; isDefault?: boolean }) {
    if (!body.key?.trim() || !body.name?.trim()) throw new ConflictException('Priority key and name are required');
    const key = body.key.trim().toLowerCase();
    const existing = await this.priorities.findOne({ where: { orgId, key } });
    if (existing) throw new ConflictException(`Priority with key '${key}' already exists`);
    if (body.isDefault) {
      await this.priorities.update({ orgId }, { isDefault: false });
    }
    return this.priorities.save(this.priorities.create({
      orgId,
      key,
      name: body.name.trim(),
      color: body.color?.trim() || '#6366f1',
      orderNum: body.orderNum ?? 0,
      isDefault: body.isDefault ?? false,
    }));
  }

  // Resolutions
  listResolutions(orgId: string) { return this.resolutions.find({ where: { orgId }, order: { orderNum: 'ASC' } }); }
  async createResolution(orgId: string, body: { key: string; name: string; description?: string; orderNum?: number }) {
    if (!body.key?.trim() || !body.name?.trim()) throw new ConflictException('Resolution key and name are required');
    const key = body.key.trim().toLowerCase();
    const existing = await this.resolutions.findOne({ where: { orgId, key } });
    if (existing) throw new ConflictException(`Resolution with key '${key}' already exists`);
    return this.resolutions.save(this.resolutions.create({
      orgId,
      key,
      name: body.name.trim(),
      description: body.description?.trim() ?? null,
      orderNum: body.orderNum ?? 0,
    }));
  }
}