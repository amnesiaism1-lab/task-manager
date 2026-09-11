import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { ProjectPermissionGuard } from '../../common/guards/project-permission.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { BoardService } from './board.service';
import { CreateBoardDto, CreateColumnDto, MapColumnStatesDto, ReorderIssueDto, UpdateColumnDto } from './dto/board.dto';

@Controller('organizations/:orgId/projects/:projectId/boards')
@UseGuards(JwtAuthGuard, OrgMembershipGuard, ProjectPermissionGuard)
@RequirePermissions('BROWSE_PROJECT')
export class BoardController {
  constructor(private readonly boards: BoardService) {}
  @Get() list(@Param('projectId') projectId: string) { return this.boards.list(projectId); }
  @Post()
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('MANAGE_BOARD')
  createBoard(@Param('projectId') projectId: string, @Body() body: CreateBoardDto) { return this.boards.createBoard(projectId, body); }
  @Post(':boardId/columns')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('MANAGE_BOARD')
  addColumn(@Param('projectId') projectId: string, @Param('boardId') boardId: string, @Body() body: CreateColumnDto) { return this.boards.addColumn(projectId, boardId, body); }
  @Patch(':boardId/columns/:columnId')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('MANAGE_BOARD')
  updateColumn(@Param('projectId') projectId: string, @Param('boardId') boardId: string, @Param('columnId') columnId: string, @Body() body: UpdateColumnDto) { return this.boards.updateColumn(projectId, boardId, columnId, body); }
  @Patch(':boardId/columns/:columnId/states')
  @UseGuards(ProjectPermissionGuard)
  @RequirePermissions('MANAGE_BOARD')
  mapStates(@Param('projectId') projectId: string, @Param('boardId') boardId: string, @Param('columnId') columnId: string, @Body() body: MapColumnStatesDto) { return this.boards.mapStates(projectId, boardId, columnId, body.workflowStateIds); }
  @Post(':boardId/issues/reorder') reorder(@Param('projectId') projectId: string, @Param('boardId') boardId: string, @Body() body: ReorderIssueDto) { return this.boards.reorder(projectId, boardId, body); }
  @Get(':boardId') getBoard(@Param('projectId') projectId: string, @Param('boardId') boardId: string) { return this.boards.getBoardIssues(projectId, boardId); }
  @Get(':boardId/issues') getIssues(@Param('projectId') projectId: string, @Param('boardId') boardId: string) { return this.boards.getBoardIssues(projectId, boardId); }
}
