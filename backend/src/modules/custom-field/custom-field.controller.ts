import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { OrgPermissionGuard } from '../../common/guards/org-permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentMember } from '../../common/decorators/current-member.decorator';
import { CreateContextDto, CreateCustomFieldDto, CreateOptionDto, SetValueDto } from './dto/custom-field.dto';
import { CustomFieldService } from './custom-field.service';

@Controller('organizations/:orgId/custom-fields')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class CustomFieldController {
  constructor(private readonly fields: CustomFieldService) {}
  @Get() list(@Param('orgId') orgId: string) { return this.fields.list(orgId); }
  @Post()
  @UseGuards(OrgPermissionGuard)
  @RequirePermissions('MANAGE_CUSTOM_FIELDS')
  create(@Param('orgId') orgId: string, @Body() body: CreateCustomFieldDto) { return this.fields.create(orgId, body); }
  @Post(':fieldId/contexts')
  @UseGuards(OrgPermissionGuard)
  @RequirePermissions('MANAGE_CUSTOM_FIELDS')
  context(@Param('orgId') orgId: string, @Param('fieldId') fieldId: string, @Body() body: CreateContextDto) { return this.fields.createContext(orgId, fieldId, body); }
  @Post(':fieldId/options')
  @UseGuards(OrgPermissionGuard)
  @RequirePermissions('MANAGE_CUSTOM_FIELDS')
  option(@Param('orgId') orgId: string, @Param('fieldId') fieldId: string, @Body() body: CreateOptionDto) { return this.fields.createOption(orgId, fieldId, body); }
  @Post('issues/:issueId/value')
  setValue(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string, @Body() body: SetValueDto) { return this.fields.setValue(orgId, issueId, memberId, body); }
}
