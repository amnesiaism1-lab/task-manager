import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('attachments')
@Index(['orgId', 'issueId', 'deletedAt'])
export class Attachment {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'org_id', type: 'uuid' }) orgId!: string;
  @Column({ name: 'issue_id', type: 'uuid' }) issueId!: string;
  @Column({ name: 'comment_id', type: 'uuid', nullable: true }) commentId!: string | null;
  @Column({ name: 'uploaded_by_member_id', type: 'uuid' }) uploadedByMemberId!: string;
  @Column({ name: 'file_name', length: 255 }) fileName!: string;
  @Column({ name: 'mime_type', length: 160 }) mimeType!: string;
  @Column({ name: 'file_size', type: 'bigint' }) fileSize!: number;
  @Column({ name: 'storage_provider', length: 32, default: 'local' }) storageProvider!: string;
  @Column({ name: 'storage_key', length: 500, unique: true }) storageKey!: string;
  @Column({ length: 128 }) checksum!: string;
  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true }) deletedAt!: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
