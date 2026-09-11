import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('automation_executions')
export class AutomationExecution {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'rule_id', type: 'uuid' }) ruleId!: string;
  @Column({ name: 'idempotency_key', length: 180 }) idempotencyKey!: string;
  @Column({ length: 32, default: 'running' }) status!: 'running' | 'completed' | 'failed';
  @Column({ name: 'result_json', type: 'jsonb', default: {} }) resultJson!: Record<string, unknown>;
  @Column({ name: 'error_message', type: 'text', nullable: true }) errorMessage!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}