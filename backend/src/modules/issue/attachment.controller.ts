import { Body, Controller, Delete, Get, Param, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../../common/guards/org-membership.guard';
import { IssuePermissionGuard } from '../../common/guards/issue-permission.guard';
import { CurrentMember } from '../../common/decorators/current-member.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { AttachmentService } from './attachment.service';
import type { UploadedAttachmentFile } from './attachment.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('organizations/:orgId/issues/:issueId/attachments')
@UseGuards(JwtAuthGuard, OrgMembershipGuard, IssuePermissionGuard)
@RequirePermissions('BROWSE_PROJECT')
export class AttachmentController {
  constructor(private readonly attachments: AttachmentService) {}

  @Post()
  @RequirePermissions('ADD_ATTACHMENT')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('orgId') orgId: string,
    @Param('issueId') issueId: string,
    @CurrentMember('id') memberId: string,
    @UploadedFile() file?: UploadedAttachmentFile,
    @Body() body?: any,
  ) {
    if (file && file.buffer) {
      return this.attachments.upload(orgId, issueId, memberId, file);
    }
    if (body && body.base64Content) {
      const buf = Buffer.from(body.base64Content, 'base64');
      return this.attachments.upload(orgId, issueId, memberId, {
        buffer: buf,
        size: buf.length,
        mimetype: body.mimeType || 'image/png',
        originalname: body.fileName || 'attachment.png',
      });
    }
    return this.attachments.upload(orgId, issueId, memberId, file!);
  }

  @Get()
  list(@Param('orgId') orgId: string, @Param('issueId') issueId: string, @CurrentMember('id') memberId: string, @Query() pagination: PaginationDto) { return this.attachments.list(orgId, issueId, memberId, pagination); }

  @Get(':attachmentId')
  async download(@Param('orgId') orgId: string, @Param('attachmentId') attachmentId: string, @CurrentMember('id') memberId: string, @Res() response: Response) {
    try {
      const result = await this.attachments.download(orgId, attachmentId, memberId);
      response.setHeader('Content-Type', result.attachment.mimeType);
      response.setHeader('Content-Disposition', `attachment; filename="${result.attachment.fileName.replace(/"/g, '')}"`);
      result.stream.pipe(response);
    } catch {
      response.status(404).json({ statusCode: 404, message: 'Attachment not found' });
    }
  }

  @Delete(':attachmentId')
  @RequirePermissions('DELETE_ATTACHMENT')
  remove(@Param('orgId') orgId: string, @Param('attachmentId') attachmentId: string, @CurrentMember('id') memberId: string) { return this.attachments.remove(orgId, attachmentId, memberId); }
}
