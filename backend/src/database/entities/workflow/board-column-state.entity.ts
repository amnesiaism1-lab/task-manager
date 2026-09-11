import { Entity, PrimaryColumn } from 'typeorm';

@Entity('board_column_states')
export class BoardColumnState {
  @PrimaryColumn({ name: 'board_column_id', type: 'uuid' }) boardColumnId!: string;
  @PrimaryColumn({ name: 'workflow_state_id', type: 'uuid' }) workflowStateId!: string;
}
