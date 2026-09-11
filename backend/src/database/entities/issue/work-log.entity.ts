import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('work_logs')
export class WorkLog {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'issue_id', type: 'uuid' }) issueId!: string;
  @Column({ name: 'author_member_id', type: 'uuid' }) authorMemberId!: string;
  @Column({ name: 'time_spent_seconds', type: 'int' }) timeSpentSeconds!: number;
  @Column({ name: 'started_at', type: 'timestamptz' }) startedAt!: Date;
  @Column({ type: 'text', nullable: true }) comment!: string | null;
  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true }) deletedAt!: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
