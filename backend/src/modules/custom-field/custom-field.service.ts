import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomField } from '../../database/entities/custom-field/custom-field.entity';
import { CustomFieldContext } from '../../database/entities/custom-field/custom-field-context.entity';
import { CustomFieldOption } from '../../database/entities/custom-field/custom-field-option.entity';
import { IssueCustomFieldValue } from '../../database/entities/custom-field/issue-custom-field-value.entity';
import { Issue } from '../../database/entities/issue/issue.entity';
import { ActivityLog } from '../../database/entities/audit/activity-log.entity';
import { OutboxEvent } from '../../database/entities/audit/outbox-event.entity';
import { EVENT_TYPES } from '../../common/constants/event-types';
import { IssueAccessService } from '../issue/issue-access.service';
import { PermissionResolverService } from '../permission/permission-resolver.service';
import { CreateContextDto, CreateCustomFieldDto, CreateOptionDto, SetValueDto } from './dto/custom-field.dto';

@Injectable()
export class CustomFieldService {
  constructor(
    @InjectRepository(CustomField) private readonly fields: Repository<CustomField>,
    @InjectRepository(CustomFieldContext) private readonly contexts: Repository<CustomFieldContext>,
    @InjectRepository(CustomFieldOption) private readonly options: Repository<CustomFieldOption>,
    @InjectRepository(IssueCustomFieldValue) private readonly values: Repository<IssueCustomFieldValue>,
    @InjectRepository(Issue) private readonly issues: Repository<Issue>,
    @InjectRepository(ActivityLog) private readonly activityLogs: Repository<ActivityLog>,
    @InjectRepository(OutboxEvent) private readonly outboxEvents: Repository<OutboxEvent>,
    private readonly issueAccess: IssueAccessService,
    private readonly permissions: PermissionResolverService,
  ) {}

  list(orgId: string) { return this.fields.find({ where: { orgId }, order: { key: 'ASC' } }); }

  async create(orgId: string, input: CreateCustomFieldDto) {
    if (await this.fields.exists({ where: { orgId, key: input.key.trim().toLowerCase() } })) throw new ConflictException('Custom field key already exists');
    return this.fields.save(this.fields.create({ orgId, key: input.key.trim().toLowerCase(), name: input.name.trim(), fieldType: input.fieldType }));
  }

  async createContext(orgId: string, fieldId: string, input: CreateContextDto) {
    const field = await this.fields.findOne({ where: { id: fieldId, orgId } });
    if (!field) throw new NotFoundException('Custom field not found');
    const context = this.contexts.create({ customFieldId: fieldId, projectId: input.projectId, issueTypeId: input.issueTypeId, isRequired: input.isRequired ?? false, position: input.position ?? 0 });
    return this.contexts.save(context);
  }

  async getContextsForProject(orgId: string, projectId: string) {
    const contexts = await this.contexts.find({ where: { projectId }, order: { position: 'ASC' } });
    return Promise.all(contexts.map(async (ctx) => {
      const field = await this.fields.findOne({ where: { id: ctx.customFieldId, orgId } });
      let options: CustomFieldOption[] = [];
      if (field?.fieldType === 'select') {
        options = await this.options.find({ where: { customFieldId: field.id }, order: { position: 'ASC' } });
      }
      return {
        ...ctx,
        field,
        options,
      };
    }));
  }

  async createOption(orgId: string, fieldId: string, input: CreateOptionDto) {
    const field = await this.fields.findOne({ where: { id: fieldId, orgId, fieldType: 'select' } });
    if (!field) throw new NotFoundException('Select custom field not found');
    return this.options.save(this.options.create({ customFieldId: fieldId, value: input.value.trim(), label: input.label.trim(), position: input.position ?? 0 }));
  }

  async setValue(orgId: string, issueId: string, memberId: string, input: SetValueDto) {
    const contextId = input.contextId || input.customFieldContextId;
    if (!contextId) throw new BadRequestException('contextId is required');
    const value = input.value !== undefined ? input.value : input.valueJson;
    if (value === undefined) throw new BadRequestException('value is required');

    const issue = await this.issueAccess.getAccessibleIssue(orgId, issueId, memberId);
    if (!(await this.permissions.hasProjectPermissions(memberId, issue.projectId, ['EDIT_ISSUE']))) throw new ForbiddenException('Insufficient project permissions');
    const context = await this.contexts.findOne({ where: { id: contextId } });
    if (!context || context.projectId !== issue.projectId || context.issueTypeId !== issue.issueTypeId) throw new ConflictException('Custom field context does not match issue');
    const field = await this.fields.findOneByOrFail({ id: context.customFieldId, orgId });
    this.validateValue(field, value);
    const existing = await this.values.findOne({ where: { issueId, customFieldContextId: contextId } });
    let saved: IssueCustomFieldValue;
    if (existing) {
      existing.valueJson = value;
      saved = await this.values.save(existing);
    } else {
      saved = await this.values.save(this.values.create({ issueId, customFieldContextId: contextId, valueJson: value }));
    }

    const payload = { issueId, customFieldId: field.id, customFieldName: field.name, value, memberId };
    await this.activityLogs.save(this.activityLogs.create({ orgId, actorType: 'member', actorMemberId: memberId, projectId: issue.projectId, issueId, eventType: EVENT_TYPES.ISSUE_UPDATED, payloadJson: payload }));
    await this.outboxEvents.save(this.outboxEvents.create({ orgId, aggregateType: 'issue', aggregateId: issueId, eventType: EVENT_TYPES.ISSUE_UPDATED, payloadJson: payload, status: 'pending', idempotencyKey: `cf-updated:${issueId}:${contextId}:${Date.now()}`, publishedAt: null, retryCount: 0, lastError: null }));

    return saved;
  }

  private validateValue(field: CustomField, value: unknown) {
    if (value === null || value === undefined) throw new ConflictException('Custom field value is required');
    const valid = field.fieldType === 'text' ? typeof value === 'string' : field.fieldType === 'number' ? typeof value === 'number' : field.fieldType === 'json' ? typeof value === 'object' : field.fieldType === 'date' ? typeof value === 'string' && !Number.isNaN(Date.parse(value)) : field.fieldType === 'user' ? typeof value === 'string' : typeof value === 'string';
    if (!valid) throw new ConflictException('Custom field value has invalid type');
  }
}
