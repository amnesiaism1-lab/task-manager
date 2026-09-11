import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('workflow_transitions')
export class WorkflowTransition {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'workflow_id', type: 'uuid' }) workflowId!: string;
  @Column({ length: 64 }) key!: string;
  @Column({ length: 120 }) name!: string;
  @Column({ name: 'from_state_id', type: 'uuid' }) fromStateId!: string;
  @Column({ name: 'to_state_id', type: 'uuid' }) toStateId!: string;
  @Column({ name: 'require_comment', default: false }) requireComment!: boolean;
  @Column({ name: 'sort_order', type: 'int', default: 0 }) sortOrder!: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
