import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { OrgPermissionGuard } from '../../common/guards/org-permission.guard';
import { ProjectPermissionGuard } from '../../common/guards/project-permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentMember } from '../../common/decorators/current-member.decorator';
import { ProjectService } from './project.service';
import { AddProjectMemberDto, AssignProjectGroupRoleDto, AssignProjectRoleDto, CreateComponentDto, CreateIssueDto, CreateProjectDto, CreateProjectRoleDto, CreateVersionDto, SetPermissionSchemeDto, TransitionIssueDto, UpdateComponentDto, UpdateIssueDto, UpdateProjectDto, UpdateProjectMemberStatusDto, UpdateVersionDto } from './dto/project.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('organizations/:orgId/projects')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class ProjectController {
  constructor(private readonly projects: ProjectService) {}

  @Post()
  @UseGuards(OrgPermissionGuard)
  @RequirePermissions('CREATE_PROJECT')
  create(@Param('orgId') orgId: string, @CurrentMember('id') memberId: string, @Body() body: CreateProjectDto) { return this.projects.create(orgId, memberId, body); }

  @Get() list(@Param('orgId') orgId: string, @CurrentMember('id') memberId: string, @Query() pagination: PaginationDto) { return this.projects.list(orgId, memberId, pagination); }

  @Get(':projectId')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('BROWSE_PROJECT')
  get(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @CurrentMember('id') memberId: string) { return this.projects.get(orgId, projectId, memberId); }

  @Get(':projectId/workflow')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('BROWSE_PROJECT')
  workflow(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @CurrentMember('id') memberId: string) { return this.projects.getProjectWorkflow(orgId, projectId, memberId); }

  @Patch(':projectId/archive')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('MANAGE_PROJECT')
  archive(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @CurrentMember('id') memberId: string) { return this.projects.archive(orgId, projectId, memberId); }

  @Patch(':projectId')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('MANAGE_PROJECT')
  update(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @CurrentMember('id') memberId: string, @Body() body: UpdateProjectDto) { return this.projects.update(orgId, projectId, memberId, body); }

  @Patch(':projectId/restore')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('MANAGE_PROJECT')
  restore(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @CurrentMember('id') memberId: string) { return this.projects.restore(orgId, projectId, memberId); }

  @Get(':projectId/members')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('BROWSE_PROJECT')
  members(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @CurrentMember('id') memberId: string) { return this.projects.listMembers(orgId, projectId, memberId); }

  @Post(':projectId/members')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('MANAGE_MEMBERS')
  addMember(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @CurrentMember('id') memberId: string, @Body() body: AddProjectMemberDto) { return this.projects.addMember(orgId, projectId, memberId, body); }

  @Patch(':projectId/members/:projectMemberId/status')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('MANAGE_MEMBERS')
  updateMemberStatus(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @Param('projectMemberId') projectMemberId: string, @CurrentMember('id') memberId: string, @Body() body: UpdateProjectMemberStatusDto) { return this.projects.updateMemberStatus(orgId, projectId, memberId, projectMemberId, body.status); }

  @Get(':projectId/roles')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('BROWSE_PROJECT')
  roles(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @CurrentMember('id') memberId: string) { return this.projects.listRoles(orgId, projectId, memberId); }

  @Post(':projectId/roles')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('MANAGE_PROJECT')
  createRole(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @CurrentMember('id') memberId: string, @Body() body: CreateProjectRoleDto) { return this.projects.createRole(orgId, projectId, memberId, body); }

  @Post(':projectId/roles/direct')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('MANAGE_PROJECT')
  assignDirectRole(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @CurrentMember('id') memberId: string, @Body() body: AssignProjectRoleDto) { return this.projects.assignDirectRole(orgId, projectId, memberId, body); }

  @Post(':projectId/roles/group')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('MANAGE_PROJECT')
  assignGroupRole(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @CurrentMember('id') memberId: string, @Body() body: AssignProjectGroupRoleDto) { return this.projects.assignGroupRole(orgId, projectId, memberId, body); }

  @Get(':projectId/permissions/effective/:projectMemberId')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('BROWSE_PROJECT')
  effectivePermissions(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @Param('projectMemberId') projectMemberId: string, @CurrentMember('id') memberId: string) { return this.projects.effectivePermissions(orgId, projectId, memberId, projectMemberId); }

  @Get(':projectId/permission-scheme')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('BROWSE_PROJECT')
  permissionScheme(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @CurrentMember('id') memberId: string) { return this.projects.getPermissionScheme(orgId, projectId, memberId); }

  @Patch(':projectId/permission-scheme')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('MANAGE_PROJECT')
  setPermissionScheme(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @CurrentMember('id') memberId: string, @Body() body: SetPermissionSchemeDto) { return this.projects.setPermissionScheme(orgId, projectId, memberId, body.entries); }

  @Get(':projectId/components')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('BROWSE_PROJECT')
  components(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @CurrentMember('id') memberId: string) { return this.projects.listComponents(orgId, projectId, memberId); }

  @Post(':projectId/components')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('MANAGE_COMPONENTS')
  createComponent(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @CurrentMember('id') memberId: string, @Body() body: CreateComponentDto) { return this.projects.createComponent(orgId, projectId, memberId, body); }

  @Patch(':projectId/components/:componentId')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('MANAGE_COMPONENTS')
  updateComponent(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @Param('componentId') componentId: string, @CurrentMember('id') memberId: string, @Body() body: UpdateComponentDto) { return this.projects.updateComponent(orgId, projectId, componentId, memberId, body); }

  @Patch(':projectId/components/:componentId/archive')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('MANAGE_COMPONENTS')
  archiveComponent(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @Param('componentId') componentId: string, @CurrentMember('id') memberId: string) { return this.projects.archiveComponent(orgId, projectId, componentId, memberId); }

  @Get(':projectId/versions')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('BROWSE_PROJECT')
  versions(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @CurrentMember('id') memberId: string) { return this.projects.listVersions(orgId, projectId, memberId); }

  @Post(':projectId/versions')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('MANAGE_VERSIONS')
  createVersion(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @CurrentMember('id') memberId: string, @Body() body: CreateVersionDto) { return this.projects.createVersion(orgId, projectId, memberId, body); }

  @Patch(':projectId/versions/:versionId')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('MANAGE_VERSIONS')
  updateVersion(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @Param('versionId') versionId: string, @CurrentMember('id') memberId: string, @Body() body: UpdateVersionDto) { return this.projects.updateVersion(orgId, projectId, versionId, memberId, body); }

  @Patch(':projectId/versions/:versionId/release')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('MANAGE_VERSIONS')
  releaseVersion(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @Param('versionId') versionId: string, @CurrentMember('id') memberId: string) { return this.projects.releaseVersion(orgId, projectId, versionId, memberId); }

  @Patch(':projectId/versions/:versionId/archive')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('MANAGE_VERSIONS')
  archiveVersion(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @Param('versionId') versionId: string, @CurrentMember('id') memberId: string) { return this.projects.archiveVersion(orgId, projectId, versionId, memberId); }

  @Post(':projectId/issues')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('CREATE_ISSUE')
  createIssue(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @CurrentMember('id') memberId: string, @Body() body: CreateIssueDto) { return this.projects.createIssue(orgId, projectId, memberId, body); }

  @Get(':projectId/issues')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('BROWSE_PROJECT')
  listIssues(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @CurrentMember('id') memberId: string, @Query() pagination: PaginationDto) { return this.projects.listIssues(orgId, projectId, memberId, pagination); }

  @Get(':projectId/backlog')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('BROWSE_PROJECT')
  backlog(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @CurrentMember('id') memberId: string, @Query() pagination: PaginationDto) { return this.projects.backlog(orgId, projectId, memberId, pagination); }

  @Patch(':projectId/issues/:issueId')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('EDIT_ISSUE')
  updateIssue(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string, @Body() body: UpdateIssueDto) { return this.projects.updateIssue(orgId, projectId, issueId, memberId, body); }

  @Post(':projectId/issues/:issueId/transition')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('TRANSITION_ISSUE')
  transition(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string, @Body() body: TransitionIssueDto) { return this.projects.transitionIssue(orgId, projectId, issueId, memberId, body); }

  @Delete(':projectId/issues/:issueId')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('DELETE_ISSUE')
  deleteIssue(@Param('orgId') orgId: string, @Param('projectId') projectId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string) { return this.projects.deleteIssue(orgId, projectId, issueId, memberId); }
}
