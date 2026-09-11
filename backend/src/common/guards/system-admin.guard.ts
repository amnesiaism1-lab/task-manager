import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/identity/user.entity';

/**
 * Guards routes to only allow System Admins (Platform Admins).
 * Reads users.is_system_admin — set via DB seeding or dedicated tooling.
 * See SRS UC-SYS-01, UC-SYS-02.
 */
@Injectable()
export class SystemAdminGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException('Authentication required');
    }

    const user = await this.users.findOne({ where: { id: userId } });
    if (!user || !user.isSystemAdmin) {
      throw new ForbiddenException('System administrator privileges required');
    }

    return true;
  }
}
