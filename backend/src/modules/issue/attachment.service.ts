import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'node:crypto';
import { extname } from 'node:path';
import { IsNull, Repository } from 'typeorm';
import { Attachment } from '../../database/entities/issue/attachment.entity';
import { Issue } from '../../database/entities/issue/issue.entity';
import { ProjectMember } from '../../database/entities/project/project-member.entity';
import { LocalStorageService } from '../storage/local-storage.service';
import { IssueAccessService } from './issue-access.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/pagination.util';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg', 'text/plain', 'text/markdown']);

export interface UploadedAttachmentFile { buffer: Buffer; size: number; mimetype: string; originalname: string; }

@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(Attachment) private readonly attachments: Repository<Attachment>,
    @InjectRepository(Issue) private readonly issues: Repository<Issue>,
    @InjectRepository(ProjectMember) private readonly projectMembers: Repository<ProjectMember>,
    private readonly storage: LocalStorageService,
    private readonly issueAccess: IssueAccessService,
  ) {}

  async upload(orgId: string, issueId: string, memberId: string, file: UploadedAttachmentFile) {
    if (!file || file.size <= 0 || file.size > MAX_FILE_SIZE) throw new ConflictException('Attachment size is invalid');
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) throw new ConflictException('Attachment type is not allowed');
    const issue = await this.issueAccess.getAccessibleIssue(orgId, issueId, memberId);
    const checksum = createHash('sha256').update(file.buffer).digest('hex');
    const storageKey = await this.storage.put(file.buffer, extname(file.originalname).toLowerCase());
    try {
      return await this.attachments.save(this.attachments.create({ orgId, issueId: issue.id, commentId: null, uploadedByMemberId: memberId, fileName: file.originalname.replace(/[\\/]/g, '_').slice(0, 255), mimeType: file.mimetype, fileSize: file.size, storageProvider: 'local', storageKey, checksum, deletedAt: null }));
    } catch (error) {
      await this.storage.remove(storageKey);
      throw error;
    }
  }

  async list(orgId: string, issueId: string, memberId: string, pagination: PaginationDto) {
    await this.issueAccess.getAccessibleIssue(orgId, issueId, memberId);
    return paginate(this.attachments.createQueryBuilder('attachment').where('attachment.org_id = :orgId AND attachment.issue_id = :issueId AND attachment.deleted_at IS NULL', { orgId, issueId }).orderBy('attachment.created_at', 'DESC'), pagination);
  }

  async download(orgId: string, attachmentId: string, memberId: string) {
    const attachment = await this.attachments.findOne({ where: { id: attachmentId, orgId, deletedAt: IsNull() } });
    if (!attachment) throw new NotFoundException('Attachment not found');
    await this.issueAccess.getAccessibleIssue(orgId, attachment.issueId, memberId);
    return { attachment, stream: this.storage.read(attachment.storageKey) };
  }

  async remove(orgId: string, attachmentId: string, memberId: string) {
    const attachment = await this.attachments.findOne({ where: { id: attachmentId, orgId, deletedAt: IsNull() } });
    if (!attachment) throw new NotFoundException('Attachment not found');
    await this.issueAccess.getAccessibleIssue(orgId, attachment.issueId, memberId);
    attachment.deletedAt = new Date();
    await this.attachments.save(attachment);
    await this.storage.remove(attachment.storageKey);
    return { success: true };
  }

}
