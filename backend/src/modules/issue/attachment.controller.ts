import { Controller, Delete, Get, Param, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { IssuePermissionGuard } from '../../common/guards/issue-permission.guard';
import { CurrentMember } from '../../common/decorators/current-member.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { AttachmentService, UploadedAttachmentFile } from './attachment.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('organizations/:orgId/issues/:issueId/attachments')
@UseGuards(JwtAuthGuard, OrgMembershipGuard, IssuePermissionGuard)
@RequirePermissions('BROWSE_PROJECT')
export class AttachmentController {
  constructor(private readonly attachments: AttachmentService) {}

  @Post()
  @RequirePermissions('ADD_ATTACHMENT')
  @UseInterceptors(FileInterceptor('file'))
  upload(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string, @UploadedFile() file: UploadedAttachmentFile) { return this.attachments.upload(orgId, issueId, memberId, file); }

  @Get()
  list(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string, @Query() pagination: PaginationDto) { return this.attachments.list(orgId, issueId, memberId, pagination); }

  @Get(':attachmentId')
  async download(@Param('orgId') orgId: string, @Param('attachmentId') attachmentId: string, @CurrentMember('id') memberId: string, @Res() response: Response) {
    const result = await this.attachments.download(orgId, attachmentId, memberId);
    response.setHeader('Content-Type', result.attachment.mimeType);
    response.setHeader('Content-Disposition', `attachment; filename="${result.attachment.fileName.replace(/"/g, '')}"`);
    result.stream.pipe(response);
  }

  @Delete(':attachmentId')
  @RequirePermissions('DELETE_ATTACHMENT')
  remove(@Param('orgId') orgId: string, @Param('attachmentId') attachmentId: string, @CurrentMember('id') memberId: string) { return this.attachments.remove(orgId, attachmentId, memberId); }
}
