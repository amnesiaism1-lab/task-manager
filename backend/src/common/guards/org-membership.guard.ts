import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationMember } from '../../database/entities/identity/organization-member.entity';

/**
 * Verify user is an active member of the organization specified by :orgId param.
 * Sets request.orgMember for downstream decorators/guards.
 */
@Injectable()
export class OrgMembershipGuard implements CanActivate {
  constructor(
    @InjectRepository(OrganizationMember)
    private readonly memberRepo: Repository<OrganizationMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const orgId = request.params?.orgId;

    if (!userId || !orgId) {
      throw new ForbiddenException('Organization context required');
    }

    const member = await this.memberRepo.findOne({
      where: { orgId, userId, status: 'active' },
    });

    if (!member) {
      throw new ForbiddenException('Not an active member of this organization');
    }

    request.orgMember = member;
    return true;
  }
}
