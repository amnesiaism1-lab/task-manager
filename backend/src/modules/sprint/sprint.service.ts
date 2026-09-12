import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { Board } from '../../database/entities/project/board.entity';
import { Sprint } from '../../database/entities/project/sprint.entity';
import { Issue } from '../../database/entities/issue/issue.entity';
import { IssueSprintHistory } from '../../database/entities/issue/issue-sprint-history.entity';
import { Project } from '../../database/entities/project/project.entity';
import { CreateSprintDto } from './dto/sprint.dto';

@Injectable()
export class SprintService {
  constructor(
    @InjectRepository(Board) private readonly boards: Repository<Board>,
    @InjectRepository(Sprint) private readonly sprints: Repository<Sprint>,
    @InjectRepository(Issue) private readonly issues: Repository<Issue>,
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    private readonly dataSource: DataSource,
  ) {}

  async create(orgId: string, projectId: string, boardId: string, input: CreateSprintDto) {
    if (!await this.projects.exists({ where: { id: projectId, orgId, archivedAt: IsNull() } })) throw new NotFoundException('Project not found');
    const board = await this.boards.findOne({ where: { id: boardId, projectId, boardType: 'scrum' } });
    if (!board) throw new ConflictException('Sprints require a Scrum board');
    return this.sprints.save(this.sprints.create({ projectId, boardId, name: input.name.trim(), goal: input.goal?.trim() ?? null, state: 'planned', startAt: null, endAt: null, closedAt: null }));
  }

  async start(orgId: string, projectId: string, sprintId: string) {
    return this.dataSource.transaction(async (manager) => {
      if (!await manager.exists(Project, { where: { id: projectId, orgId, archivedAt: IsNull() } })) throw new NotFoundException('Project not found');
      const sprint = await manager.findOne(Sprint, { where: { id: sprintId, projectId } });
      if (!sprint) throw new NotFoundException('Sprint not found');
      if (sprint.state !== 'planned') throw new ConflictException('Only planned sprints can start');
      const active = await manager.findOne(Sprint, { where: { boardId: sprint.boardId, state: 'active' } });
      if (active) throw new ConflictException('Board already has an active sprint');
      sprint.state = 'active'; sprint.startAt = new Date();
      return manager.save(sprint);
    });
  }

  async close(orgId: string, projectId: string, sprintId: string) {
    if (!await this.projects.exists({ where: { id: projectId, orgId, archivedAt: IsNull() } })) throw new NotFoundException('Project not found');
    const sprint = await this.sprints.findOne({ where: { id: sprintId, projectId } });
    if (!sprint) throw new NotFoundException('Sprint not found');
    if (sprint.state !== 'active') throw new ConflictException('Only active sprints can close');
    sprint.state = 'closed'; sprint.closedAt = new Date();
    return this.sprints.save(sprint);
  }

  async assign(orgId: string, projectId: string, sprintId: string, issueId: string, memberId: string) {
    return this.dataSource.transaction(async (manager) => {
      if (!await manager.exists(Project, { where: { id: projectId, orgId, archivedAt: IsNull() } })) throw new NotFoundException('Project not found');
      const sprint = await manager.findOne(Sprint, { where: { id: sprintId, projectId } });
      const issue = await manager.findOne(Issue, { where: { id: issueId, projectId } });
      if (!sprint || !issue) throw new NotFoundException('Sprint or issue not found');
      if (sprint.state === 'closed') throw new ConflictException('Cannot assign to a closed sprint');
      if (issue.sprintId === sprintId) return issue;
      if (issue.sprintId) {
        await manager.update(IssueSprintHistory, { issueId, sprintId: issue.sprintId, removedAt: IsNull() }, { removedAt: new Date(), removedByMemberId: memberId });
      }
      issue.sprintId = sprintId;
      await manager.save(issue);
      await manager.save(IssueSprintHistory, manager.create(IssueSprintHistory, { issueId, sprintId, addedByMemberId: memberId, removedByMemberId: null, removedAt: null }));
      return issue;
    });
  }

  list(orgId: string, projectId: string) {
    return this.projects.exists({ where: { id: projectId, orgId, archivedAt: IsNull() } }).then((exists) => {
      if (!exists) throw new NotFoundException('Project not found');
      return this.sprints.find({ where: { projectId }, order: { createdAt: 'DESC' } });
    });
  }
}
