import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
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
  ) {}

  async getBootstrap(userId: string, preferredOrgId?: string, preferredProjectId?: string) {
    const user = await this.users.findOne({ where: { id: userId, status: 'active' } });
    if (!user) throw new NotFoundException('User not found');

    const memberships = await this.orgMembers.find({
      where: { userId, status: 'active' },
      order: { joinedAt: 'ASC' },
    });

    const orgIds = memberships.map((m) => m.orgId);
    const orgs = orgIds.length ? await this.orgs.find({ where: { id: In(orgIds), status: 'active' } }) : [];

    let activeOrgId = preferredOrgId && orgIds.includes(preferredOrgId) ? preferredOrgId : (orgIds[0] || null);
    const activeMember = memberships.find((m) => m.orgId === activeOrgId) || memberships[0] || null;

    if (!activeOrgId && orgs.length > 0) {
      activeOrgId = orgs[0].id;
    }

    let orgProjects: Project[] = [];
    let orgMembersList: any[] = [];
    let unreadCount = 0;
    let initialIssues: any[] = [];

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

      const activeProjectId = preferredProjectId && orgProjects.some((p) => p.id === preferredProjectId)
        ? preferredProjectId
        : (orgProjects[0]?.id || null);

      if (activeProjectId) {
        const issues = await this.issues.find({
          where: { projectId: activeProjectId, orgId: activeOrgId, deletedAt: IsNull() },
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
      activeProjectId: preferredProjectId && orgProjects.some((p) => p.id === preferredProjectId)
        ? preferredProjectId
        : (orgProjects[0]?.id || null),
      members: orgMembersList,
      unreadNotificationsCount: unreadCount,
      initialIssues,
    };
  }
}
