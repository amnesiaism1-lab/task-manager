import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'org_id', type: 'uuid' }) orgId!: string;
  @Column({ name: 'issue_id', type: 'uuid' }) issueId!: string;
  @Column({ name: 'author_member_id', type: 'uuid' }) authorMemberId!: string;
  @Column({ name: 'parent_comment_id', type: 'uuid', nullable: true }) parentCommentId!: string | null;
  @Column({ type: 'text' }) body!: string;
  @Column({ name: 'body_format', length: 32, default: 'plain' }) bodyFormat!: string;
  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true }) deletedAt!: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
