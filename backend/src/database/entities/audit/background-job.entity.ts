import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('background_jobs')
@Index(['status', 'nextRunAt'])
@Index(['orgId', 'idempotencyKey'], { unique: true })
export class BackgroundJob {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'org_id', type: 'uuid' }) orgId!: string;
  @Column({ name: 'requested_by_member_id', type: 'uuid', nullable: true }) requestedByMemberId!: string | null;
  @Column({ name: 'job_type', length: 64 }) jobType!: 'reconciliation' | 'import' | 'export';
  @Column({ length: 32, default: 'pending' }) status!: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  @Column({ name: 'idempotency_key', length: 180 }) idempotencyKey!: string;
  @Column({ name: 'input_json', type: 'jsonb', default: {} }) inputJson!: Record<string, unknown>;
  @Column({ name: 'result_json', type: 'jsonb', nullable: true }) resultJson!: Record<string, unknown> | null;
  @Column({ type: 'int', default: 0 }) progress!: number;
  @Column({ type: 'int', default: 0 }) attempts!: number;
  @Column({ name: 'next_run_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }) nextRunAt!: Date;
  @Column({ name: 'lease_until', type: 'timestamptz', nullable: true }) leaseUntil!: Date | null;
  @Column({ name: 'last_error', type: 'text', nullable: true }) lastError!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}