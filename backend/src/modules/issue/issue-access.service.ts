import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Issue } from '../../database/entities/issue/issue.entity';
import { IssueSecurityGrant } from '../../database/entities/issue/issue-security-grant.entity';
import { IssueSecurityLevel } from '../../database/entities/issue/issue-security-level.entity';
import { IssueSecurityScheme } from '../../database/entities/issue/issue-security-scheme.entity';
import { Project } from '../../database/entities/project/project.entity';
import { ProjectMember } from '../../database/entities/project/project-member.entity';

@Injectable()
export class IssueAccessService {
  constructor(
    @InjectRepository(Issue) private readonly issues: Repository<Issue>,
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    @InjectRepository(ProjectMember) private readonly members: Repository<ProjectMember>,
    @InjectRepository(IssueSecurityScheme) private readonly schemes: Repository<IssueSecurityScheme>,
    @InjectRepository(IssueSecurityLevel) private readonly levels: Repository<IssueSecurityLevel>,
    @InjectRepository(IssueSecurityGrant) private readonly grants: Repository<IssueSecurityGrant>,
  ) {}

  private memberCache = new Map<string, { val: ProjectMember | null; exp: number }>();
  private projectCache = new Map<string, { secSchemeId: string | null; exp: number }>();

  async getAccessibleIssue(orgId: string, issueId: string, memberId: string) {
    const issue = await this.issues.findOne({ where: { id: issueId, orgId, deletedAt: IsNull() } });
    if (!issue) throw new NotFoundException('Issue not found');
    if (!(await this.canAccess(issue, memberId))) throw new ForbiddenException('Issue security level denied');
    return issue;
  }

  async canAccess(issue: Issue, memberId: string): Promise<boolean> {
    const memKey = `${issue.projectId}:${memberId}`;
    let membership: ProjectMember | null = null;
    const cachedMem = this.memberCache.get(memKey);
    if (cachedMem && cachedMem.exp > Date.now()) {
      membership = cachedMem.val;
    } else {
      membership = await this.members.findOne({ where: { projectId: issue.projectId, orgMemberId: memberId, status: 'active' } });
      this.memberCache.set(memKey, { val: membership, exp: Date.now() + 60_000 });
    }
    if (!membership) return false;

    let secSchemeId: string | null = null;
    const cachedProj = this.projectCache.get(issue.projectId);
    if (cachedProj && cachedProj.exp > Date.now()) {
      secSchemeId = cachedProj.secSchemeId;
    } else {
      const project = await this.projects.findOne({ where: { id: issue.projectId, orgId: issue.orgId } });
      secSchemeId = project?.issueSecuritySchemeId || null;
      this.projectCache.set(issue.projectId, { secSchemeId, exp: Date.now() + 120_000 });
    }

    if (!secSchemeId) return true;
    const scheme = await this.schemes.findOne({ where: { id: secSchemeId, orgId: issue.orgId } });
    if (!scheme) return true;
    const levelId = issue.securityLevelId ?? scheme.defaultLevelId;
    if (!levelId) return true;
    const level = await this.levels.findOne({ where: { id: levelId, schemeId: scheme.id } });
    if (!level) return false;
    const grants = await this.grants.find({ where: { levelId: level.id } });
    for (const grant of grants) {
      if (grant.grantType === 'member' && grant.orgMemberId === memberId) return true;
      if (grant.grantType === 'reporter' && issue.reporterMemberId === memberId) return true;
      if (grant.grantType === 'assignee' && issue.assigneeMemberId === memberId) return true;
      if (grant.grantType === 'group' && grant.groupId && await this.memberInGroup(grant.groupId, memberId)) return true;
      if (grant.grantType === 'project_role' && grant.projectRoleKey && await this.memberHasProjectRole(membership.id, grant.projectRoleKey)) return true;
    }
    return false;
  }

  private async memberInGroup(groupId: string, memberId: string) {
    const result = await this.grants.query(
      'SELECT 1 FROM group_members WHERE group_id = $1 AND org_member_id = $2 LIMIT 1',
      [groupId, memberId],
    );
    return result.length > 0;
  }

  private async memberHasProjectRole(projectMemberId: string, roleKey: string) {
    const result = await this.grants.query(
      'SELECT 1 FROM project_member_roles pmr INNER JOIN project_roles pr ON pr.id = pmr.project_role_id WHERE pmr.project_member_id = $1 AND pr.key = $2 LIMIT 1',
      [projectMemberId, roleKey],
    );
    return result.length > 0;
  }
}