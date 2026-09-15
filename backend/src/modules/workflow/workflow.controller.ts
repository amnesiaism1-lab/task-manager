import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { OrgPermissionGuard } from '../../common/guards/org-permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import {
  CreateGuardDto,
  CreateWorkflowDto,
  CreateStateDto,
  UpdateStateDto,
  CreateTransitionDto,
  UpdateTransitionDto,
} from './dto/workflow.dto';
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

  // --- States ---
  @Post(':workflowId/states')
  @UseGuards(OrgPermissionGuard)
  @RequirePermissions('MANAGE_WORKFLOWS')
  createState(
    @Param('orgId') orgId: string,
    @Param('workflowId') workflowId: string,
    @Body() body: CreateStateDto,
  ) {
    return this.workflows.createState(orgId, workflowId, body);
  }

  @Patch(':workflowId/states/:stateId')
  @UseGuards(OrgPermissionGuard)
  @RequirePermissions('MANAGE_WORKFLOWS')
  updateState(
    @Param('orgId') orgId: string,
    @Param('workflowId') workflowId: string,
    @Param('stateId') stateId: string,
    @Body() body: UpdateStateDto,
  ) {
    return this.workflows.updateState(orgId, workflowId, stateId, body);
  }

  @Delete(':workflowId/states/:stateId')
  @UseGuards(OrgPermissionGuard)
  @RequirePermissions('MANAGE_WORKFLOWS')
  deleteState(
    @Param('orgId') orgId: string,
    @Param('workflowId') workflowId: string,
    @Param('stateId') stateId: string,
  ) {
    return this.workflows.deleteState(orgId, workflowId, stateId);
  }

  // --- Transitions ---
  @Post(':workflowId/transitions')
  @UseGuards(OrgPermissionGuard)
  @RequirePermissions('MANAGE_WORKFLOWS')
  createTransition(
    @Param('orgId') orgId: string,
    @Param('workflowId') workflowId: string,
    @Body() body: CreateTransitionDto,
  ) {
    return this.workflows.createTransition(orgId, workflowId, body);
  }

  @Patch(':workflowId/transitions/:transitionId')
  @UseGuards(OrgPermissionGuard)
  @RequirePermissions('MANAGE_WORKFLOWS')
  updateTransition(
    @Param('orgId') orgId: string,
    @Param('workflowId') workflowId: string,
    @Param('transitionId') transitionId: string,
    @Body() body: UpdateTransitionDto,
  ) {
    return this.workflows.updateTransition(orgId, workflowId, transitionId, body);
  }

  @Delete(':workflowId/transitions/:transitionId')
  @UseGuards(OrgPermissionGuard)
  @RequirePermissions('MANAGE_WORKFLOWS')
  deleteTransition(
    @Param('orgId') orgId: string,
    @Param('workflowId') workflowId: string,
    @Param('transitionId') transitionId: string,
  ) {
    return this.workflows.deleteTransition(orgId, workflowId, transitionId);
  }
}

