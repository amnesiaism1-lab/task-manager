import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { OrganizationMemberRole } from '../../database/entities/identity/org-member-role.entity';
import { OrganizationRolePermission } from '../../database/entities/identity/org-role-permission.entity';
import { GroupMember } from '../../database/entities/identity/group-member.entity';
import { ProjectMember } from '../../database/entities/project/project-member.entity';
import { ProjectMemberRole } from '../../database/entities/project/project-member-role.entity';
import { ProjectGroupRole } from '../../database/entities/project/project-group-role.entity';
import { ProjectRole } from '../../database/entities/project/project-role.entity';
import { PermissionScheme } from '../../database/entities/project/permission-scheme.entity';
import { PermissionSchemeEntry } from '../../database/entities/project/permission-scheme-entry.entity';
import { Project } from '../../database/entities/project/project.entity';

const orgPermCache = new Map<string, { permissions: Set<string>; cachedAt: number }>();
const projectPermCache = new Map<string, { permissions: Set<string>; cachedAt: number }>();
const PERM_CACHE_TTL_MS = 60 * 1000;

@Injectable()
export class PermissionResolverService {
  constructor(
    @InjectRepository(OrganizationMemberRole) private readonly memberRoles: Repository<OrganizationMemberRole>,
    @InjectRepository(OrganizationRolePermission) private readonly rolePermissions: Repository<OrganizationRolePermission>,
    @InjectRepository(GroupMember) private readonly groupMembers: Repository<GroupMember>,
    @InjectRepository(ProjectMember) private readonly projectMembers: Repository<ProjectMember>,
    @InjectRepository(ProjectMemberRole) private readonly projectMemberRoles: Repository<ProjectMemberRole>,
    @InjectRepository(ProjectGroupRole) private readonly projectGroupRoles: Repository<ProjectGroupRole>,
    @InjectRepository(ProjectRole) private readonly projectRoles: Repository<ProjectRole>,
    @InjectRepository(PermissionScheme) private readonly permissionSchemes: Repository<PermissionScheme>,
    @InjectRepository(PermissionSchemeEntry) private readonly permissionEntries: Repository<PermissionSchemeEntry>,
    @InjectRepository(Project) private readonly projects: Repository<Project>,
  ) {}

  @OnEvent('permission.changed')
  handlePermissionChanged(payload?: { memberId?: string; projectId?: string }) {
    if (payload?.memberId) {
      orgPermCache.delete(`org:${payload.memberId}`);
      if (payload?.projectId) {
        projectPermCache.delete(`proj:${payload.memberId}:${payload.projectId}`);
      } else {
        for (const key of projectPermCache.keys()) {
          if (key.startsWith(`proj:${payload.memberId}:`)) {
            projectPermCache.delete(key);
          }
        }
      }
    } else {
      orgPermCache.clear();
      projectPermCache.clear();
    }
  }

  clearCache(memberId?: string) {
    this.handlePermissionChanged({ memberId });
  }

  async hasOrgPermissions(memberId: string, permissions: string[]): Promise<boolean> {
    if (permissions.length === 0) return true;
    const now = Date.now();
    const cacheKey = `org:${memberId}`;
    const cached = orgPermCache.get(cacheKey);

    if (cached && (now - cached.cachedAt) < PERM_CACHE_TTL_MS) {
      return permissions.every((p) => cached.permissions.has(p));
    }

    const grants = await this.rolePermissions.createQueryBuilder('grant')
      .innerJoin(OrganizationMemberRole, 'memberRole', 'memberRole.role_id = grant.role_id AND memberRole.org_member_id = :memberId', { memberId })
      .select('grant.permission_key', 'permission')
      .distinct(true)
      .getRawMany<{ permission: string }>();

    const grantedSet = new Set(grants.map((g) => g.permission));
    orgPermCache.set(cacheKey, { permissions: grantedSet, cachedAt: now });
    return permissions.every((p) => grantedSet.has(p));
  }

  async hasProjectPermissions(memberId: string, projectId: string, permissions: string[]): Promise<boolean> {
    if (permissions.length === 0) return true;
    const now = Date.now();
    const cacheKey = `proj:${memberId}:${projectId}`;
    const cached = projectPermCache.get(cacheKey);

    if (cached && (now - cached.cachedAt) < PERM_CACHE_TTL_MS) {
      return permissions.every((p) => cached.permissions.has(p));
    }

    const [membership, project, scheme] = await Promise.all([
      this.projectMembers.findOne({ where: { orgMemberId: memberId, projectId, status: 'active' } }),
      this.projects.findOne({ where: { id: projectId } }),
      this.permissionSchemes.findOne({ where: { projectId } }),
    ]);

    if (!membership || !project || !scheme) return false;

    const [directRoles, groupMemberships] = await Promise.all([
      this.projectMemberRoles.find({ where: { projectMemberId: membership.id } }),
      this.groupMembers.find({ where: { orgMemberId: memberId } }),
    ]);

    const groupIds = groupMemberships.map((groupMembership) => groupMembership.groupId);
    const groupRoles = groupIds.length
      ? await this.projectGroupRoles.find({ where: { groupId: In(groupIds) } })
      : [];
    const projectRoleIds = new Set(directRoles.map((role) => role.projectRoleId));
    if (groupRoles.length > 0) {
      const validProjectRoles = await this.projectRoles.find({ where: { id: In(groupRoles.map((role) => role.projectRoleId)), projectId } });
      validProjectRoles.forEach((role) => projectRoleIds.add(role.id));
    }
    if (projectRoleIds.size === 0) return false;

    const grants = await this.permissionEntries.createQueryBuilder('entry')
      .where('entry.scheme_id = :schemeId', { schemeId: scheme.id })
      .andWhere('entry.project_role_id IN (:...roleIds)', { roleIds: [...projectRoleIds] })
      .select('entry.permission_key', 'permission')
      .distinct(true)
      .getRawMany<{ permission: string }>();

    const grantedSet = new Set(grants.map((g) => g.permission));
    projectPermCache.set(cacheKey, { permissions: grantedSet, cachedAt: now });
    return permissions.every((p) => grantedSet.has(p));
  }
}
