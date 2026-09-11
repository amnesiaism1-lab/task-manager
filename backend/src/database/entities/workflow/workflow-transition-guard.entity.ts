import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('workflow_transition_guards')
export class WorkflowTransitionGuard {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'transition_id', type: 'uuid' }) transitionId!: string;
  @Column({ name: 'guard_type', length: 32 }) guardType!: 'requires_fields' | 'json_logic' | 'dsl' | 'custom';
  @Column({ name: 'config_json', type: 'jsonb' }) configJson!: Record<string, unknown>;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
