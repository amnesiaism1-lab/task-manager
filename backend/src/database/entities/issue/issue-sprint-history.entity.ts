import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('issue_sprint_history')
export class IssueSprintHistory {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'issue_id', type: 'uuid' }) issueId!: string;
  @Column({ name: 'sprint_id', type: 'uuid' }) sprintId!: string;
  @Column({ name: 'added_by_member_id', type: 'uuid' }) addedByMemberId!: string;
  @Column({ name: 'added_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }) addedAt!: Date;
  @Column({ name: 'removed_by_member_id', type: 'uuid', nullable: true }) removedByMemberId!: string | null;
  @Column({ name: 'removed_at', type: 'timestamptz', nullable: true }) removedAt!: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
