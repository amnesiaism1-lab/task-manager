import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { OrgPermissionGuard } from '../../common/guards/org-permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentMember } from '../../common/decorators/current-member.decorator';
import { OrganizationService } from './organization.service';
import {
  AcceptInvitationDto,
  AddMemberDto,
  AssignOrgRoleDto,
  CreateDepartmentDto,
  CreateGroupDto,
  CreateOrgRoleDto,
  CreateOrganizationDto,
  DeclineInvitationDto,
  InviteMemberDto,
  UpdateDepartmentDto,
  UpdateGroupDto,
  UpdateMemberStatusDto,
  UpdateOrganizationDto,
} from './dto/organization.dto';

interface RequestWithUser extends Request {
  user: { id: string };
}

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationController {
  constructor(private readonly organizations: OrganizationService) {}

  @Post()
  create(@Req() request: RequestWithUser, @Body() body: CreateOrganizationDto) {
    return this.organizations.create(request.user.id, body);
  }

  @Get()
  list(@Req() request: RequestWithUser) {
    return this.organizations.listForUser(request.user.id);
  }

  /** UC-ORG-10: List pending invitations for the authenticated user by email. */
  @Get('invitations/me')
  myInvitations(@Req() request: RequestWithUser) {
    return this.organizations.listUserPendingInvitations(request.user.id);
  }

  /** UC-ORG-02: Accept invitation (Guest or logged-in user with token). */
  @Post('invitations/accept')
  accept(@Req() request: RequestWithUser, @Body() body: AcceptInvitationDto) {
    return this.organizations.accept(request.user.id, body.invitationId, body.token);
  }

  /** UC-ORG-10: Invitee declines a pending invitation. */
  @Post('invitations/decline')
  decline(@Req() request: RequestWithUser, @Body() body: DeclineInvitationDto) {
    return this.organizations.declineInvitation(request.user.id, body.invitationId, body.token);
  }

  @Get(':orgId')
  @UseGuards(OrgMembershipGuard)
  get(@Param('orgId') orgId: string) {
    return this.organizations.get(orgId);
  }

  @Patch(':orgId')
  @UseGuards(OrgMembershipGuard, OrgPermissionGuard)
  @RequirePermissions('MANAGE_ORG')
  update(@Param('orgId') orgId: string, @Body() body: UpdateOrganizationDto) {
    return this.organizations.update(orgId, body);
  }

  @Get(':orgId/members')
  @UseGuards(OrgMembershipGuard)
  members(@Param('orgId') orgId: string) {
    return this.organizations.listMembers(orgId);
  }

  @Get(':orgId/roles')
  @UseGuards(OrgMembershipGuard)
  roles(@Param('orgId') orgId: string) {
    return this.organizations.listRoles(orgId);
  }

  @Get(':orgId/invitations')
  @UseGuards(OrgMembershipGuard, OrgPermissionGuard)
  @RequirePermissions('MANAGE_USERS')
  invitations(@Param('orgId') orgId: string) {
    return this.organizations.listInvitations(orgId);
  }

  @Get(':orgId/departments')
  @UseGuards(OrgMembershipGuard)
  departments(@Param('orgId') orgId: string) {
    return this.organizations.listDepartments(orgId);
  }

  @Get(':orgId/departments/:departmentId/members')
  @UseGuards(OrgMembershipGuard)
  departmentMembers(@Param('orgId') orgId: string, @Param('departmentId') departmentId: string) {
    return this.organizations.listDepartmentMembers(orgId, departmentId);
  }

  @Get(':orgId/groups')
  @UseGuards(OrgMembershipGuard)
  groups(@Param('orgId') orgId: string) {
    return this.organizations.listGroups(orgId);
  }

  @Get(':orgId/groups/:groupId/members')
  @UseGuards(OrgMembershipGuard)
  groupMembers(@Param('orgId') orgId: string, @Param('groupId') groupId: string) {
    return this.organizations.listGroupMembers(orgId, groupId);
  }

  @Post(':orgId/invitations')
  @UseGuards(OrgMembershipGuard, OrgPermissionGuard)
  @RequirePermissions('MANAGE_USERS')
  invite(@Param('orgId') orgId: string, @CurrentMember('id') memberId: string, @Body() body: InviteMemberDto) {
    return this.organizations.invite(orgId, memberId, body);
  }

  @Delete(':orgId/invitations/:invitationId')
  @UseGuards(OrgMembershipGuard, OrgPermissionGuard)
  @RequirePermissions('MANAGE_USERS')
  revokeInvitation(@Param('orgId') orgId: string, @Param('invitationId') invitationId: string) {
    return this.organizations.revokeInvitation(orgId, invitationId);
  }

  /** UC-ORG-10: Org Admin resends an expired/stale invitation with a fresh token. */
  @Post(':orgId/invitations/:invitationId/resend')
  @UseGuards(OrgMembershipGuard, OrgPermissionGuard)
  @RequirePermissions('MANAGE_USERS')
  resendInvitation(@Param('orgId') orgId: string, @Param('invitationId') invitationId: string, @CurrentMember('id') memberId: string) {
    return this.organizations.resendInvitation(orgId, invitationId, memberId);
  }

  /** UC-ORG-11: Active member voluntarily leaves the organization. */
  @Delete(':orgId/members/me')
  @UseGuards(OrgMembershipGuard)
  leaveOrganization(@Param('orgId') orgId: string, @Req() request: RequestWithUser) {
    return this.organizations.leaveOrganization(orgId, request.user.id);
  }

  @Patch(':orgId/members/:memberId/status')
  @UseGuards(OrgMembershipGuard, OrgPermissionGuard)
  @RequirePermissions('MANAGE_USERS')
  updateStatus(@Param('orgId') orgId: string, @Param('memberId') memberId: string, @Body() body: UpdateMemberStatusDto) {
    return this.organizations.updateMemberStatus(orgId, memberId, body.status);
  }

  @Post(':orgId/departments')
  @UseGuards(OrgMembershipGuard, OrgPermissionGuard)
  @RequirePermissions('MANAGE_DEPARTMENTS')
  createDepartment(@Param('orgId') orgId: string, @Body() body: CreateDepartmentDto) {
    return this.organizations.createDepartment(orgId, body);
  }

  @Post(':orgId/departments/:departmentId/members')
  @UseGuards(OrgMembershipGuard, OrgPermissionGuard)
  @RequirePermissions('MANAGE_DEPARTMENTS')
  addDepartmentMember(@Param('orgId') orgId: string, @Param('departmentId') departmentId: string, @Body() body: AddMemberDto) {
    return this.organizations.addDepartmentMember(orgId, departmentId, body);
  }

  @Patch(':orgId/departments/:departmentId')
  @UseGuards(OrgMembershipGuard, OrgPermissionGuard)
  @RequirePermissions('MANAGE_DEPARTMENTS')
  updateDepartment(@Param('orgId') orgId: string, @Param('departmentId') departmentId: string, @Body() body: UpdateDepartmentDto) {
    return this.organizations.updateDepartment(orgId, departmentId, body);
  }

  @Delete(':orgId/departments/:departmentId/members/:memberId')
  @UseGuards(OrgMembershipGuard, OrgPermissionGuard)
  @RequirePermissions('MANAGE_DEPARTMENTS')
  removeDepartmentMember(@Param('orgId') orgId: string, @Param('departmentId') departmentId: string, @Param('memberId') memberId: string) {
    return this.organizations.removeDepartmentMember(orgId, departmentId, memberId);
  }

  @Post(':orgId/groups')
  @UseGuards(OrgMembershipGuard, OrgPermissionGuard)
  @RequirePermissions('MANAGE_GROUPS')
  createGroup(@Param('orgId') orgId: string, @Body() body: CreateGroupDto) {
    return this.organizations.createGroup(orgId, body);
  }

  @Post(':orgId/groups/:groupId/members')
  @UseGuards(OrgMembershipGuard, OrgPermissionGuard)
  @RequirePermissions('MANAGE_GROUPS')
  addGroupMember(@Param('orgId') orgId: string, @Param('groupId') groupId: string, @CurrentMember('id') actorMemberId: string, @Body() body: AddMemberDto) {
    return this.organizations.addGroupMember(orgId, groupId, actorMemberId, body);
  }

  @Patch(':orgId/groups/:groupId')
  @UseGuards(OrgMembershipGuard, OrgPermissionGuard)
  @RequirePermissions('MANAGE_GROUPS')
  updateGroup(@Param('orgId') orgId: string, @Param('groupId') groupId: string, @Body() body: UpdateGroupDto) {
    return this.organizations.updateGroup(orgId, groupId, body);
  }

  @Delete(':orgId/groups/:groupId/members/:memberId')
  @UseGuards(OrgMembershipGuard, OrgPermissionGuard)
  @RequirePermissions('MANAGE_GROUPS')
  removeGroupMember(@Param('orgId') orgId: string, @Param('groupId') groupId: string, @Param('memberId') memberId: string) {
    return this.organizations.removeGroupMember(orgId, groupId, memberId);
  }

  @Post(':orgId/roles')
  @UseGuards(OrgMembershipGuard, OrgPermissionGuard)
  @RequirePermissions('MANAGE_ORG')
  createRole(@Param('orgId') orgId: string, @Body() body: CreateOrgRoleDto) {
    return this.organizations.createRole(orgId, body);
  }

  @Post(':orgId/roles/assign')
  @UseGuards(OrgMembershipGuard, OrgPermissionGuard)
  @RequirePermissions('MANAGE_ORG')
  assignRole(@Param('orgId') orgId: string, @Body() body: AssignOrgRoleDto) {
    return this.organizations.assignRole(orgId, body);
  }

  @Post(':orgId/roles/:roleId/permissions')
  @UseGuards(OrgMembershipGuard, OrgPermissionGuard)
  @RequirePermissions('MANAGE_ORG')
  setRolePermissions(@Param('orgId') orgId: string, @Param('roleId') roleId: string, @Body() body: { permissionKeys: string[] }) {
    return this.organizations.setRolePermissions(orgId, roleId, body.permissionKeys);
  }

  @Get(':orgId/roles/:roleId/permissions')
  @UseGuards(OrgMembershipGuard, OrgPermissionGuard)
  @RequirePermissions('MANAGE_ORG')
  rolePermissions(@Param('orgId') orgId: string, @Param('roleId') roleId: string) {
    return this.organizations.getRolePermissions(orgId, roleId);
  }
}
