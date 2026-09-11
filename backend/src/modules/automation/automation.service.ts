import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutomationComponent } from '../../database/entities/automation/automation-component.entity';
import { AutomationExecution } from '../../database/entities/automation/automation-execution.entity';
import { AutomationRule } from '../../database/entities/automation/automation-rule.entity';

@Injectable()
export class AutomationService {
  constructor(@InjectRepository(AutomationRule) private readonly rules: Repository<AutomationRule>, @InjectRepository(AutomationComponent) private readonly components: Repository<AutomationComponent>, @InjectRepository(AutomationExecution) private readonly executions: Repository<AutomationExecution>) {}
  list(orgId: string, memberId: string) { return this.rules.find({ where: { orgId, createdByMemberId: memberId }, order: { updatedAt: 'DESC' } }); }
  async create(orgId: string, memberId: string, input: { name: string; projectId?: string; components: Array<{ componentType: AutomationComponent['componentType']; componentKey: string; parentComponentId?: string; configJson?: Record<string, unknown>; position?: number }> }) { const triggers = input.components.filter((item) => item.componentType === 'trigger'); if (triggers.length !== 1 || input.components.some((item) => /url|code|script/i.test(item.componentKey) || JSON.stringify(item.configJson ?? {}).match(/https?:\/\//))) throw new ConflictException('Automation must contain one safe trigger and no code or callback URL'); const rule = await this.rules.save(this.rules.create({ orgId, createdByMemberId: memberId, projectId: input.projectId ?? null, name: input.name.trim(), version: 1, status: 'draft' })); await this.components.save(input.components.map((item) => this.components.create({ ruleId: rule.id, parentComponentId: item.parentComponentId ?? null, componentType: item.componentType, componentKey: item.componentKey, configJson: item.configJson ?? {}, position: item.position ?? 0 }))); return { ...rule, components: await this.components.find({ where: { ruleId: rule.id }, order: { position: 'ASC' } }) }; }
  async activate(orgId: string, memberId: string, id: string) { const rule = await this.rules.findOne({ where: { id, orgId, createdByMemberId: memberId } }); if (!rule) throw new NotFoundException('Automation rule not found'); const components = await this.components.find({ where: { ruleId: id } }); if (components.filter((item) => item.componentType === 'trigger').length !== 1) throw new ConflictException('Automation must have exactly one trigger'); rule.status = 'active'; return this.rules.save(rule); }
  async execute(orgId: string, memberId: string, id: string, idempotencyKey: string) {
    const rule = await this.rules.findOne({ where: { id, orgId, createdByMemberId: memberId } });
    if (!rule) throw new NotFoundException('Automation rule not found');
    if (rule.status !== 'active') throw new ConflictException('Only active automation rules can execute');
    const existing = await this.executions.findOne({ where: { ruleId: id, idempotencyKey } });
    if (existing) return existing;
    return this.executions.save(this.executions.create({ ruleId: id, idempotencyKey, status: 'completed', resultJson: { actions: 0, note: 'Execution recorded; command actions require an approved action handler.' }, errorMessage: null }));
  }
}
