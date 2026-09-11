import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomField } from '../../database/entities/custom-field/custom-field.entity';
import { CustomFieldContext } from '../../database/entities/custom-field/custom-field-context.entity';
import { CustomFieldOption } from '../../database/entities/custom-field/custom-field-option.entity';
import { IssueCustomFieldValue } from '../../database/entities/custom-field/issue-custom-field-value.entity';
import { Issue } from '../../database/entities/issue/issue.entity';
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

  async createOption(orgId: string, fieldId: string, input: CreateOptionDto) {
    const field = await this.fields.findOne({ where: { id: fieldId, orgId, fieldType: 'select' } });
    if (!field) throw new NotFoundException('Select custom field not found');
    return this.options.save(this.options.create({ customFieldId: fieldId, value: input.value.trim(), label: input.label.trim(), position: input.position ?? 0 }));
  }

  async setValue(orgId: string, issueId: string, memberId: string, input: SetValueDto) {
    const issue = await this.issueAccess.getAccessibleIssue(orgId, issueId, memberId);
    if (!(await this.permissions.hasProjectPermissions(memberId, issue.projectId, ['EDIT_ISSUE']))) throw new ForbiddenException('Insufficient project permissions');
    const context = await this.contexts.findOne({ where: { id: input.contextId } });
    if (!context || context.projectId !== issue.projectId || context.issueTypeId !== issue.issueTypeId) throw new ConflictException('Custom field context does not match issue');
    const field = await this.fields.findOneByOrFail({ id: context.customFieldId, orgId });
    this.validateValue(field, input.value);
    return this.values.save(this.values.create({ issueId, customFieldContextId: input.contextId, valueJson: input.value }));
  }

  private validateValue(field: CustomField, value: unknown) {
    if (value === null || value === undefined) throw new ConflictException('Custom field value is required');
    const valid = field.fieldType === 'text' ? typeof value === 'string' : field.fieldType === 'number' ? typeof value === 'number' : field.fieldType === 'json' ? typeof value === 'object' : field.fieldType === 'date' ? typeof value === 'string' && !Number.isNaN(Date.parse(value)) : field.fieldType === 'user' ? typeof value === 'string' : typeof value === 'string';
    if (!valid) throw new ConflictException('Custom field value has invalid type');
  }
}
