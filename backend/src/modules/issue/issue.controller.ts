import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { IssuePermissionGuard } from '../../common/guards/issue-permission.guard';
import { CurrentMember } from '../../common/decorators/current-member.decorator';
import { CurrentIssue } from '../../common/decorators/current-issue.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { IssueService } from './issue.service';
import { AddLabelDto, AddWatcherDto, CreateCommentDto, CreateIssueLinkDto, CreateWorkLogDto } from './dto/issue.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Issue } from '../../database/entities/issue/issue.entity';

@Controller('organizations/:orgId/issues/:issueId')
@UseGuards(JwtAuthGuard, OrgMembershipGuard, IssuePermissionGuard)
@RequirePermissions('BROWSE_PROJECT')
export class IssueController {
  constructor(private readonly issues: IssueService) {}
  @Get() get(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string, @CurrentIssue() issue?: Issue) { return this.issues.getDetail(orgId, issueId, memberId, issue); }
  @Patch() @RequirePermissions('EDIT_ISSUE') update(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string, @Body() body: any) { return this.issues.update(orgId, issueId, memberId, body); }
  @Delete() @RequirePermissions('DELETE_ISSUE') delete(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string) { return this.issues.delete(orgId, issueId, memberId); }
  @Post('transitions') @RequirePermissions('TRANSITION_ISSUE') transition(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string, @Body() body: any) { return this.issues.transition(orgId, issueId, memberId, body); }
  @Get('transitions') transitions(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string) { return this.issues.listTransitions(orgId, issueId, memberId); }
  @Get('labels') labels(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string) { return this.issues.listLabels(orgId, issueId, memberId); }
  @Get('watchers') watchers(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string) { return this.issues.listWatchers(orgId, issueId, memberId); }
  @Get('links') links(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string) { return this.issues.listLinks(orgId, issueId, memberId); }
  @Get('history') history(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string) { return this.issues.listHistory(orgId, issueId, memberId); }
  @Post('comments') @RequirePermissions('ADD_COMMENT') addComment(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string, @Body() body: CreateCommentDto) { return this.issues.addComment(orgId, issueId, memberId, body); }
  @Get('comments') comments(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string, @Query() pagination: PaginationDto) { return this.issues.listComments(orgId, issueId, memberId, pagination); }
  @Delete('comments/:commentId') @RequirePermissions('DELETE_COMMENT') deleteComment(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @Param('commentId') commentId: string, @CurrentMember('id') memberId: string) { return this.issues.deleteComment(orgId, issueId, commentId, memberId); }
  @Post('work-logs') @RequirePermissions('LOG_WORK') addWorkLog(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string, @Body() body: CreateWorkLogDto) { return this.issues.addWorkLog(orgId, issueId, memberId, body); }
  @Post('worklogs') @RequirePermissions('LOG_WORK') addWorkLogAlias(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string, @Body() body: CreateWorkLogDto) { return this.issues.addWorkLog(orgId, issueId, memberId, body); }
  @Get('work-logs') workLogs(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string, @Query() pagination: PaginationDto) { return this.issues.listWorkLogs(orgId, issueId, memberId, pagination); }
  @Get('worklogs') workLogsAlias(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string, @Query() pagination: PaginationDto) { return this.issues.listWorkLogs(orgId, issueId, memberId, pagination); }
  @Post('labels') @RequirePermissions('EDIT_ISSUE') addLabel(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string, @Body() body: AddLabelDto) { return this.issues.addLabel(orgId, issueId, memberId, body); }
  @Post('watchers') @RequirePermissions('MANAGE_WATCHERS') addWatcher(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string, @Body() body: AddWatcherDto) { return this.issues.addWatcher(orgId, issueId, memberId, body); }
  @Post('links') @RequirePermissions('LINK_ISSUE') linkIssue(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string, @Body() body: CreateIssueLinkDto) { return this.issues.linkIssue(orgId, issueId, memberId, body); }
  @Delete('links/:linkId') @RequirePermissions('LINK_ISSUE') deleteLink(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @Param('linkId') linkId: string, @CurrentMember('id') memberId: string) { return this.issues.deleteLink(orgId, issueId, linkId, memberId); }
}
