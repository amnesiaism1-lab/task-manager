import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { PermissionResolverService } from '../../modules/permission/permission-resolver.service.js';

/**
 * Check org-level permissions using @RequirePermissions() decorator.
 * Must be used after OrgMembershipGuard.
 */
@Injectable()
export class OrgPermissionGuard implements CanActivate {
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

    if (!member) {
      throw new ForbiddenException('Organization member context required');
    }

    const hasPermission = await this.permissionResolver.hasOrgPermissions(
      member.id,
      requiredPermissions,
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient organization permissions');
    }

    return true;
  }
}
