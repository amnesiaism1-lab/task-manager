import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('workflow_states')
export class WorkflowState {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'workflow_id', type: 'uuid' }) workflowId!: string;
  @Column({ length: 64 }) key!: string;
  @Column({ length: 120 }) name!: string;
  @Column({ length: 32, default: 'todo' }) category!: 'todo' | 'in_progress' | 'done';
  @Column({ name: 'is_initial', default: false }) isInitial!: boolean;
  @Column({ name: 'is_terminal', default: false }) isTerminal!: boolean;
  @Column({ type: 'int', default: 0 }) position!: number;
}
