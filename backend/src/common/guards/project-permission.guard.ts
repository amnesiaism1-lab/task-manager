import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { PermissionResolverService } from '../../modules/permission/permission-resolver.service.js';

/**
 * Check project-level permissions. Must be used after OrgMembershipGuard.
 * Resolves permissions from permission_scheme_entries via direct + group roles.
 * Deny overrides allow per SRS BR-13.
 */
@Injectable()
export class ProjectPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionResolver: PermissionResolverService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const member = request.orgMember;
    const projectId = request.params?.projectId;

    if (!member || !projectId) {
      throw new ForbiddenException('Project context required');
    }

    const hasPermission = await this.permissionResolver.hasProjectPermissions(
      member.id,
      projectId,
      requiredPermissions,
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient project permissions');
    }

    return true;
  }
}
