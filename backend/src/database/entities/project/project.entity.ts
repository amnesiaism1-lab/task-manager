import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'org_id', type: 'uuid' }) orgId!: string;
  @Column({ length: 32 }) key!: string;
  @Column({ length: 160 }) name!: string;
  @Column({ type: 'text', nullable: true }) description!: string | null;
  @Column({ length: 32, default: 'private' }) visibility!: 'private' | 'org' | 'public';
  @Column({ name: 'created_by_member_id', type: 'uuid' }) createdByMemberId!: string;
  @Column({ name: 'workflow_key', type: 'varchar', length: 64, nullable: true }) workflowKey!: string | null;
  @Column({ name: 'permission_scheme_id', type: 'uuid', nullable: true }) permissionSchemeId!: string | null;
  @Column({ name: 'issue_security_scheme_id', type: 'uuid', nullable: true }) issueSecuritySchemeId!: string | null;
  @Column({ name: 'next_issue_number', type: 'bigint', default: 1 }) nextIssueNumber!: number;
  @Column({ name: 'archived_at', type: 'timestamptz', nullable: true }) archivedAt!: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
