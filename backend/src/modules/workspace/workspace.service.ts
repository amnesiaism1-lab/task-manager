import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import { User } from '../../database/entities/identity/user.entity';
import { Organization } from '../../database/entities/identity/organization.entity';
import { OrganizationMember } from '../../database/entities/identity/organization-member.entity';
import { Project } from '../../database/entities/project/project.entity';
import { Notification } from '../../database/entities/audit/notification.entity';
import { Issue } from '../../database/entities/issue/issue.entity';
import { WorkflowState } from '../../database/entities/workflow/workflow-state.entity';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Organization) private readonly orgs: Repository<Organization>,
    @InjectRepository(OrganizationMember) private readonly orgMembers: Repository<OrganizationMember>,
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    @InjectRepository(Notification) private readonly notifications: Repository<Notification>,
    @InjectRepository(Issue) private readonly issues: Repository<Issue>,
    @InjectRepository(WorkflowState) private readonly states: Repository<WorkflowState>,
    private readonly dataSource: DataSource,
  ) {}

  async getBootstrap(userId: string, preferredOrgId?: string, preferredProjectId?: string) {
    const user = await this.users.findOne({ where: { id: userId, status: 'active' } });
    if (!user) throw new NotFoundException('User not found');

    let memberships = await this.orgMembers.find({
      where: { userId, status: 'active' },
      order: { joinedAt: 'ASC' },
    });

    // 1. Auto-enroll into default enterprise org (Acme Cloud Platform / ACME) if user has 0 memberships
    if (memberships.length === 0) {
      try {
        const defaultOrg = await this.dataSource.query(
          "SELECT id FROM organizations WHERE key = 'ACME' OR status = 'active' ORDER BY (key = 'ACME') DESC, created_at ASC LIMIT 1"
        );
        if (defaultOrg && defaultOrg.length > 0) {
          const orgId = defaultOrg[0].id;
          const insMem = await this.dataSource.query(
            "INSERT INTO organization_members (org_id, user_id, status, joined_at, created_at, updated_at) VALUES ($1, $2, 'active', NOW(), NOW(), NOW()) RETURNING id",
            [orgId, userId]
          );
          const orgMemberId = insMem[0]?.id;

          const role = await this.dataSource.query(
            "SELECT id FROM org_roles WHERE org_id = $1 AND key = 'member' LIMIT 1",
            [orgId]
          );
          if (role[0]?.id && orgMemberId) {
            await this.dataSource.query(
              "INSERT INTO org_member_roles (org_member_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
              [orgMemberId, role[0].id]
            );
          }

          memberships = await this.orgMembers.find({
            where: { userId, status: 'active' },
            order: { joinedAt: 'ASC' },
          });
        }
      } catch (enrollErr) {
        console.warn('Auto-enroll on bootstrap failed:', enrollErr);
      }
    }

    const orgIds = memberships.map((m) => m.orgId);
    let orgs = orgIds.length ? await this.orgs.find({ where: { id: In(orgIds), status: 'active' } }) : [];

    // 2. Determine active organization:
    // If preferredOrgId has issues, keep it; otherwise prioritize ACME (seeded with sprints & issues)
    let activeOrgId: string | null = null;
    if (preferredOrgId && orgIds.includes(preferredOrgId)) {
      const issueCount = await this.issues.count({ where: { orgId: preferredOrgId, deletedAt: IsNull() } });
      if (issueCount > 0) {
        activeOrgId = preferredOrgId;
      }
    }

    if (!activeOrgId) {
      const acmeOrg = orgs.find((o) => o.key === 'ACME');
      if (acmeOrg) {
        activeOrgId = acmeOrg.id;
      } else {
        activeOrgId = orgIds[0] || (orgs[0]?.id ?? null);
      }
    }

    let activeMember = memberships.find((m) => m.orgId === activeOrgId) || memberships[0] || null;

    let orgProjects: Project[] = [];
    let orgMembersList: any[] = [];
    let unreadCount = 0;
    let initialIssues: any[] = [];
    let resolvedActiveProjectId: string | null = null;

    if (activeOrgId && activeMember) {
      const [projects, members, unread] = await Promise.all([
        this.projects.find({ where: { orgId: activeOrgId, archivedAt: IsNull() }, order: { createdAt: 'ASC' } }),
        this.orgMembers.createQueryBuilder('om')
          .innerJoin(User, 'user', 'user.id = om.user_id')
          .where('om.org_id = :orgId AND om.status = :status', { orgId: activeOrgId, status: 'active' })
          .select(['om.id AS id', 'om.org_id AS "orgId"', 'om.user_id AS "userId"', 'om.status AS status', 'user.email AS email', 'user.full_name AS "fullName"', 'user.avatar_url AS "avatarUrl"'])
          .getRawMany(),
        this.notifications.count({ where: { recipientMemberId: activeMember.id, readAt: IsNull() } }),
      ]);

      orgProjects = projects;
      orgMembersList = members.map((m) => ({
        ...m,
        user: {
          id: m.userId,
          fullName: m.fullName,
          email: m.email,
          avatarUrl: m.avatarUrl,
        },
      }));
      unreadCount = unread;

      // Prioritize project CLOUD or project with issues over empty projects
      if (preferredProjectId && orgProjects.some((p) => p.id === preferredProjectId)) {
        const pIssueCount = await this.issues.count({ where: { projectId: preferredProjectId, deletedAt: IsNull() } });
        if (pIssueCount > 0) {
          resolvedActiveProjectId = preferredProjectId;
        }
      }

      if (!resolvedActiveProjectId) {
        const cloudProj = orgProjects.find((p) => p.key === 'CLOUD');
        resolvedActiveProjectId = cloudProj?.id || orgProjects[0]?.id || null;
      }

      // Ensure activeMember is enrolled in project_members for resolvedActiveProjectId
      if (resolvedActiveProjectId) {
        try {
          const pm = await this.dataSource.query(
            "SELECT id FROM project_members WHERE project_id = $1 AND org_member_id = $2 AND status = 'active' LIMIT 1",
            [resolvedActiveProjectId, activeMember.id]
          );
          if (!pm || pm.length === 0) {
            const insPm = await this.dataSource.query(
              "INSERT INTO project_members (project_id, org_member_id, status, joined_at, created_at) VALUES ($1, $2, 'active', NOW(), NOW()) ON CONFLICT (project_id, org_member_id) DO UPDATE SET status = 'active' RETURNING id",
              [resolvedActiveProjectId, activeMember.id]
            );
            const projRole = await this.dataSource.query(
              "SELECT id FROM project_roles WHERE project_id = $1 AND (key = 'member' OR name ILIKE '%member%') LIMIT 1",
              [resolvedActiveProjectId]
            );
            if (projRole[0]?.id && insPm[0]?.id) {
              await this.dataSource.query(
                "INSERT INTO project_member_roles (project_member_id, project_role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                [insPm[0].id, projRole[0].id]
              );
            }
          }
        } catch (pmErr) {
          console.warn('Auto-enroll in project error:', pmErr);
        }

        const issues = await this.issues.find({
          where: { projectId: resolvedActiveProjectId, orgId: activeOrgId, deletedAt: IsNull() },
          order: { updatedAt: 'DESC' },
          take: 50,
        });

        const stateIds = [...new Set(issues.map((i) => i.stateId))];
        const states = stateIds.length ? await this.states.find({ where: { id: In(stateIds) } }) : [];
        const stateMap = Object.fromEntries(states.map((s) => [s.id, s]));
        const memberMap = new Map(orgMembersList.map((m) => [m.id, m]));

        initialIssues = issues.map((i) => {
          const assignee = i.assigneeMemberId ? memberMap.get(i.assigneeMemberId) || null : null;
          return {
            ...i,
            state: stateMap[i.stateId] || null,
            assignee,
            assigneeMember: assignee,
          };
        });
      }
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        isSystemAdmin: user.isSystemAdmin ?? false,
      },
      organizations: orgs.map((o) => {
        const m = memberships.find((mem) => mem.orgId === o.id);
        return {
          id: o.id,
          orgId: o.id,
          name: o.name,
          key: o.key,
          memberId: m?.id || null,
        };
      }),
      activeOrgId,
      activeMemberId: activeMember?.id || null,
      projects: orgProjects,
      activeProjectId: resolvedActiveProjectId,
      members: orgMembersList,
      unreadNotificationsCount: unreadCount,
      initialIssues,
    };
  }
}
