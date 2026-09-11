import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceService } from './workspace.service';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@Controller('workspace')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get('bootstrap')
  getBootstrap(
    @Req() req: AuthenticatedRequest,
    @Query('orgId') orgId?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.workspaceService.getBootstrap(req.user.id, orgId, projectId);
  }
}
