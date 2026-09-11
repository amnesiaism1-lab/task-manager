import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SystemAdminGuard } from '../../common/guards/system-admin.guard';
import { AdminService } from './admin.service';
import { AdminCreateUserDto, AdminTestMailDto, AdminUpdateOrganizationDto, AdminUpdateUserDto, AdminUpdateUserStatusDto, ListUsersQueryDto } from './dto/admin.dto';

interface AuthenticatedRequest extends Request { user: { id: string }; }

/**
 * AdminController — Platform-level System Admin REST endpoints.
 * All routes require JWT authentication + SystemAdminGuard (users.is_system_admin = true).
 * Implements UC-SYS-01 (Global User Management) and UC-SYS-02 (Global Org Management).
 */
@Controller('admin')
@UseGuards(JwtAuthGuard, SystemAdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  // ─── UC-SYS-01: Global User Management ────────────────────────────────────

  /**
   * GET /admin/users
   * UC-SYS-01: Search and list all users globally. Supports filter by email/status.
   */
  @Get('users')
  listUsers(@Query() query: ListUsersQueryDto) {
    return this.admin.listUsers(query);
  }

  /**
   * POST /admin/users
   * Create a new platform user directly from Admin console.
   */
  @Post('users')
  createUser(
    @Req() request: AuthenticatedRequest,
    @Body() body: AdminCreateUserDto,
  ) {
    return this.admin.createUser(request.user.id, body);
  }

  /**
   * GET /admin/users/:userId
   * UC-SYS-01: Get full details of a specific user, including active session count.
   */
  @Get('users/:userId')
  getUser(@Param('userId') userId: string) {
    return this.admin.getUser(userId);
  }

  /**
   * PATCH /admin/users/:userId
   * Update an existing user's details, role, status, or password.
   */
  @Patch('users/:userId')
  updateUser(
    @Req() request: AuthenticatedRequest,
    @Param('userId') userId: string,
    @Body() body: AdminUpdateUserDto,
  ) {
    return this.admin.updateUser(request.user.id, userId, body);
  }

  /**
   * DELETE /admin/users/:userId
   * Delete or deactivate a user with database constraint protection.
   */
  @Delete('users/:userId')
  deleteUser(
    @Req() request: AuthenticatedRequest,
    @Param('userId') userId: string,
  ) {
    return this.admin.deleteUser(request.user.id, userId);
  }

  /**
   * PATCH /admin/users/:userId/status
   * UC-SYS-01: Globally suspend, activate, or deactivate a user account.
   * Suspending/deactivating also revokes all active sessions.
   * Guard: Cannot change own account status.
   */
  @Patch('users/:userId/status')
  updateUserStatus(
    @Req() request: AuthenticatedRequest,
    @Param('userId') userId: string,
    @Body() body: AdminUpdateUserStatusDto,
  ) {
    return this.admin.updateUserStatus(request.user.id, userId, body.status);
  }

  /**
   * DELETE /admin/users/:userId/sessions
   * UC-SYS-01: Force-revoke all active sessions for a specific user.
   * Used for incident response when account compromise is suspected.
   * Guard: Cannot revoke own sessions via this endpoint — use /auth/logout-all.
   */
  @Delete('users/:userId/sessions')
  forceRevokeAllSessions(
    @Req() request: AuthenticatedRequest,
    @Param('userId') userId: string,
  ) {
    return this.admin.forceRevokeAllSessions(request.user.id, userId);
  }

  // ─── UC-SYS-02: Global Organization Management ────────────────────────────

  /**
   * GET /admin/organizations
   * UC-SYS-02: List all organizations (tenants) on the platform with pagination.
   */
  @Get('organizations')
  listOrganizations(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.admin.listOrganizations(
      parseInt(page ?? '1', 10),
      parseInt(limit ?? '20', 10),
    );
  }

  /**
   * GET /admin/organizations/:orgId
   * UC-SYS-02: Get details of a specific organization (tenant).
   */
  @Get('organizations/:orgId')
  getOrganization(@Param('orgId') orgId: string) {
    return this.admin.getOrganization(orgId);
  }

  /**
   * PATCH /admin/organizations/:orgId
   * UC-SYS-02: Update an organization's status (active/suspended) or service plan.
   */
  @Patch('organizations/:orgId')
  updateOrganization(
    @Param('orgId') orgId: string,
    @Body() body: AdminUpdateOrganizationDto,
  ) {
    return this.admin.updateOrganization(orgId, body);
  }

  // ─── Mail Operations & Outbox ─────────────────────────────────────────────

  /**
   * POST /admin/mail/test
   * Send a test email via configured SMTP (or dev fallback).
   */
  @Post('mail/test')
  sendTestMail(
    @Req() request: AuthenticatedRequest,
    @Body() body: AdminTestMailDto,
  ) {
    return this.admin.sendTestMail(request.user.id, body);
  }

  /**
   * GET /admin/mail/outbox
   * View recent dispatched emails from in-memory outbox buffer.
   */
  @Get('mail/outbox')
  getMailOutbox() {
    return this.admin.getMailOutbox();
  }
}
