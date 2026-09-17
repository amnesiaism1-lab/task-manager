import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { CurrentMember } from '../../common/decorators/current-member.decorator';
import { ProjectPermissionGuard } from '../../common/guards/project-permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { SprintService } from './sprint.service';
import { AssignIssueDto, CreateSprintDto } from './dto/sprint.dto';

@Controller('organizations/:orgId/projects/:projectId')
@UseGuards(JwtAuthGuard, OrgMembershipGuard, ProjectPermissionGuard)
export class SprintController {
  constructor(private readonly sprints: SprintService) {}
  @Post('sprints')
  @RequirePermissions('MANAGE_SPRINTS')
  createForProject(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @Body() body: CreateSprintDto) { return this.sprints.createForProject(orgId, projectId, body); }

  @Post('boards/:boardId/sprints')
  @RequirePermissions('MANAGE_SPRINTS')
  create(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @Param('boardId') boardId: string, @Body() body: CreateSprintDto) { return this.sprints.create(orgId, projectId, boardId, body); }

  @Get('sprints')
  @RequirePermissions('BROWSE_PROJECT')
  list(@Param('orgId') orgId: string, @Param('projectId') projectId: string) { return this.sprints.list(orgId, projectId); }

  @Post('sprints/:sprintId/start')
  @RequirePermissions('MANAGE_SPRINTS')
  startPost(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @Param('sprintId') sprintId: string) { return this.sprints.start(orgId, projectId, sprintId); }

  @Patch('sprints/:sprintId/start')
  @RequirePermissions('MANAGE_SPRINTS')
  start(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @Param('sprintId') sprintId: string) { return this.sprints.start(orgId, projectId, sprintId); }

  @Post('sprints/:sprintId/close')
  @RequirePermissions('MANAGE_SPRINTS')
  closePost(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @Param('sprintId') sprintId: string) { return this.sprints.close(orgId, projectId, sprintId); }

  @Patch('sprints/:sprintId/close')
  @RequirePermissions('MANAGE_SPRINTS')
  close(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @Param('sprintId') sprintId: string) { return this.sprints.close(orgId, projectId, sprintId); }
  @Post('sprints/:sprintId/issues')
  @RequirePermissions('EDIT_ISSUE')
  assign(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @Param('sprintId') sprintId: string, @CurrentMember('id') memberId: string, @Body() body: AssignIssueDto) { return this.sprints.assign(orgId, projectId, sprintId, body.issueId, memberId); }
}
