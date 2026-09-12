import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { Board } from '../../database/entities/project/board.entity';
import { BoardColumn } from '../../database/entities/project/board-column.entity';
import { BoardIssuePosition } from '../../database/entities/project/board-issue-position.entity';
import { BoardColumnState } from '../../database/entities/workflow/board-column-state.entity';
import { Issue } from '../../database/entities/issue/issue.entity';
import { WorkflowState } from '../../database/entities/workflow/workflow-state.entity';
import { Project } from '../../database/entities/project/project.entity';
import { Workflow } from '../../database/entities/workflow/workflow.entity';
import { DataSource } from 'typeorm';
import { LexoRank } from '../../common/utils/lexorank.util';
import { CreateBoardDto, CreateColumnDto, ReorderIssueDto, UpdateColumnDto } from './dto/board.dto';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board) private readonly boards: Repository<Board>,
    @InjectRepository(BoardColumn) private readonly columns: Repository<BoardColumn>,
    @InjectRepository(BoardIssuePosition) private readonly positions: Repository<BoardIssuePosition>,
    @InjectRepository(Issue) private readonly issues: Repository<Issue>,
    @InjectRepository(BoardColumnState) private readonly columnStates: Repository<BoardColumnState>,
    @InjectRepository(WorkflowState) private readonly states: Repository<WorkflowState>,
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    @InjectRepository(Workflow) private readonly workflows: Repository<Workflow>,
    private readonly dataSource: DataSource,
  ) {}

  async createBoard(projectId: string, input: CreateBoardDto) { return this.boards.save(this.boards.create({ projectId, boardType: input.boardType, name: input.name.trim(), description: input.description?.trim() ?? null })); }

  async list(projectId: string) {
    const boards = await this.boards.find({ where: { projectId }, order: { createdAt: 'ASC' } });
    if (boards.length === 0) return [];
    const boardIds = boards.map((b) => b.id);
    const columns = await this.columns.find({ where: { boardId: In(boardIds) }, order: { position: 'ASC' } });
    const columnsByBoard = new Map<string, BoardColumn[]>();
    columns.forEach((col) => {
      const list = columnsByBoard.get(col.boardId) || [];
      list.push(col);
      columnsByBoard.set(col.boardId, list);
    });
    return boards.map((b) => ({ ...b, columns: columnsByBoard.get(b.id) || [] }));
  }

  async addColumn(projectId: string, boardId: string, input: CreateColumnDto) {
    const board = await this.boards.findOne({ where: { id: boardId, projectId } });
    if (!board) throw new NotFoundException('Board not found');
    const position = await this.columns.count({ where: { boardId } });
    return this.columns.save(this.columns.create({ boardId, name: input.name.trim(), position, wipLimit: input.wipLimit ?? null }));
  }

  async updateColumn(projectId: string, boardId: string, columnId: string, input: UpdateColumnDto) {
    const column = await this.columns.findOne({ where: { id: columnId, boardId } });
    if (!column || !await this.boards.exists({ where: { id: boardId, projectId } })) throw new NotFoundException('Column not found');
    column.name = input.name.trim();
    if (input.wipLimit !== undefined) column.wipLimit = input.wipLimit ?? null;
    if (input.position !== undefined) column.position = input.position;
    return this.columns.save(column);
  }

  async mapStates(projectId: string, boardId: string, columnId: string, workflowStateIds: string[]) {
    const column = await this.columns.findOne({ where: { id: columnId, boardId } });
    if (!column || !await this.boards.exists({ where: { id: boardId, projectId } })) throw new NotFoundException('Column not found');
    if (new Set(workflowStateIds).size !== workflowStateIds.length) throw new ConflictException('A workflow state can only be mapped once per column');
    const project = await this.projects.findOne({ where: { id: projectId } });
    const workflow = project?.workflowKey ? await this.workflows.findOne({ where: { orgId: project.orgId, key: project.workflowKey, isActive: true } }) : null;
    if (!project || !workflow) throw new ConflictException('Project workflow is not configured');
    const states = workflowStateIds.length ? await this.states.find({ where: { id: In(workflowStateIds), workflowId: workflow.id } }) : [];
    if (states.length !== workflowStateIds.length) throw new ConflictException('All mapped states must belong to the project workflow');
    return this.dataSource.transaction(async (manager) => {
      const otherMappings = await manager.createQueryBuilder(BoardColumnState, 'mapping')
        .innerJoin(BoardColumn, 'otherColumn', 'otherColumn.id = mapping.board_column_id')
        .where('otherColumn.board_id = :boardId AND mapping.workflow_state_id IN (:...stateIds) AND mapping.board_column_id != :columnId', { boardId, stateIds: workflowStateIds, columnId })
        .getCount();
      if (otherMappings) throw new ConflictException('A workflow state is already mapped to another board column');
      await manager.delete(BoardColumnState, { boardColumnId: columnId });
      if (workflowStateIds.length) await manager.save(BoardColumnState, workflowStateIds.map((workflowStateId) => manager.create(BoardColumnState, { boardColumnId: columnId, workflowStateId })));
      return manager.find(BoardColumnState, { where: { boardColumnId: columnId } });
    });
  }

  async reorder(projectId: string, boardId: string, input: ReorderIssueDto) {
    const board = await this.boards.findOne({ where: { id: boardId, projectId } });
    if (!board) throw new NotFoundException('Board not found');
    const issue = await this.issues.findOne({ where: { id: input.issueId, projectId } });
    if (!issue) throw new NotFoundException('Issue not found in project');
    let rank = LexoRank.between(input.previousRank ?? null, input.nextRank ?? null);
    while (await this.positions.findOne({ where: { boardId, rank } })) {
      rank = LexoRank.between(rank, input.nextRank ?? null);
    }
    const existing = await this.positions.findOne({ where: { boardId, issueId: input.issueId } });
    if (existing) {
      existing.rank = rank;
      return this.positions.save(existing);
    }
    return this.positions.save(this.positions.create({ boardId, issueId: input.issueId, rank }));
  }

  async getBoardIssues(projectId: string, boardId: string) {
    const [board, columns, issues, positions] = await Promise.all([
      this.boards.findOne({ where: { id: boardId, projectId } }),
      this.columns.find({ where: { boardId }, order: { position: 'ASC' } }),
      this.issues.find({ where: { projectId, deletedAt: IsNull() }, order: { createdAt: 'DESC' } }),
      this.positions.find({ where: { boardId } }),
    ]);

    if (!board) throw new NotFoundException('Board not found');

    const columnIds = columns.map((column) => column.id);
    const stateIds = [...new Set(issues.map((issue) => issue.stateId))];

    const [mappings, states] = await Promise.all([
      columnIds.length ? this.columnStates.find({ where: { boardColumnId: In(columnIds) } }) : Promise.resolve([]),
      stateIds.length ? this.states.find({ where: { id: In(stateIds) } }) : Promise.resolve([]),
    ]);

    const rankByIssue = Object.fromEntries(positions.map((position) => [position.issueId, position.rank]));
    const columnByState = Object.fromEntries(mappings.map((mapping) => [mapping.workflowStateId, mapping.boardColumnId]));
    const stateById = Object.fromEntries(states.map((state) => [state.id, state]));
    const fallbackColumnId = columns[0]?.id;

    return {
      board,
      columns: columns.map((column) => ({
        ...column,
        stateIds: mappings.filter((mapping) => mapping.boardColumnId === column.id).map((mapping) => mapping.workflowStateId),
        issues: issues
          .filter((issue) => (columnByState[issue.stateId] ?? fallbackColumnId) === column.id)
          .sort((a, b) => (rankByIssue[a.id] ?? '~~').localeCompare(rankByIssue[b.id] ?? '~~'))
          .map((issue) => ({ ...issue, rank: rankByIssue[issue.id] ?? null, state: stateById[issue.stateId] ?? null })),
      })),
    };
  }
}
