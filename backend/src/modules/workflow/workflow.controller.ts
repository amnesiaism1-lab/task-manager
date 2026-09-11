import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { OrgPermissionGuard } from '../../common/guards/org-permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CreateGuardDto, CreateWorkflowDto } from './dto/workflow.dto';
import { WorkflowService } from './workflow.service';

@Controller('organizations/:orgId/workflows')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class WorkflowController {
  constructor(private readonly workflows: WorkflowService) {}
  @Get() list(@Param('orgId') orgId: string) { return this.workflows.list(orgId); }
  @Get(':workflowId') detail(@Param('orgId') orgId: string, @Param('workflowId') workflowId: string) { return this.workflows.detail(orgId, workflowId); }
  @Post()
  @UseGuards(OrgPermissionGuard)
  @RequirePermissions('MANAGE_WORKFLOWS')
  create(@Param('orgId') orgId: string, @Body() body: CreateWorkflowDto) { return this.workflows.create(orgId, body); }
  @Post('guards')
  @UseGuards(OrgPermissionGuard)
  @RequirePermissions('MANAGE_WORKFLOWS')
  addGuard(@Param('orgId') orgId: string, @Body() body: CreateGuardDto) { return this.workflows.addGuard(orgId, body); }
}
