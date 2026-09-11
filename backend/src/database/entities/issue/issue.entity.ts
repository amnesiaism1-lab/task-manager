import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('issues')
@Index(['projectId', 'key'], { unique: true })
export class Issue {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'org_id', type: 'uuid' }) orgId!: string;
  @Column({ name: 'project_id', type: 'uuid' }) projectId!: string;
  @Column({ name: 'issue_type_id', type: 'uuid' }) issueTypeId!: string;
  @Column({ name: 'workflow_id', type: 'uuid' }) workflowId!: string;
  @Column({ name: 'state_id', type: 'uuid' }) stateId!: string;
  @Column({ length: 64 }) key!: string;
  @Column({ length: 255 }) summary!: string;
  @Column({ type: 'text', nullable: true }) description!: string | null;
  @Column({ name: 'reporter_member_id', type: 'uuid' }) reporterMemberId!: string;
  @Column({ name: 'assignee_member_id', type: 'uuid', nullable: true }) assigneeMemberId!: string | null;
  @Column({ name: 'sprint_id', type: 'uuid', nullable: true }) sprintId!: string | null;
  @Column({ name: 'parent_issue_id', type: 'uuid', nullable: true }) parentIssueId!: string | null;
  @Column({ name: 'resolution_id', type: 'uuid', nullable: true }) resolutionId!: string | null;
  @Column({ name: 'security_level_id', type: 'uuid', nullable: true }) securityLevelId!: string | null;
  @Column({ name: 'due_at', type: 'timestamptz', nullable: true }) dueAt!: Date | null;
  @Column({ name: 'original_estimate_seconds', type: 'int', nullable: true }) originalEstimateSeconds!: number | null;
  @Column({ name: 'remaining_estimate_seconds', type: 'int', nullable: true }) remainingEstimateSeconds!: number | null;
  @Column({ name: 'time_spent_seconds', type: 'int', default: 0 }) timeSpentSeconds!: number;
  @Column({ length: 32, default: 'Medium' }) priority!: string;
  @Column({ name: 'component_id', type: 'uuid', nullable: true }) componentId!: string | null;
  @Column({ name: 'fix_version_id', type: 'uuid', nullable: true }) fixVersionId!: string | null;
  @Column({ type: 'int', default: 1 }) version!: number;
  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true }) resolvedAt!: Date | null;
  @Column({ name: 'archived_at', type: 'timestamptz', nullable: true }) archivedAt!: Date | null;
  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true }) deletedAt!: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
