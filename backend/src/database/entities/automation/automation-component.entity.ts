import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('automation_rule_components')
export class AutomationComponent {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'rule_id', type: 'uuid' }) ruleId!: string;
  @Column({ name: 'parent_component_id', type: 'uuid', nullable: true }) parentComponentId!: string | null;
  @Column({ name: 'component_type', length: 32 }) componentType!: 'trigger' | 'condition' | 'branch' | 'action';
  @Column({ name: 'component_key', length: 64 }) componentKey!: string;
  @Column({ type: 'jsonb', default: {} }) configJson!: Record<string, unknown>;
  @Column({ type: 'int', default: 0 }) position!: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}