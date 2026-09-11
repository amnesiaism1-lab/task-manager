import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('custom_field_contexts')
@Index(['customFieldId', 'projectId', 'issueTypeId'], { unique: true })
export class CustomFieldContext {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'custom_field_id', type: 'uuid' }) customFieldId!: string;
  @Column({ name: 'project_id', type: 'uuid' }) projectId!: string;
  @Column({ name: 'issue_type_id', type: 'uuid' }) issueTypeId!: string;
  @Column({ name: 'is_required', default: false }) isRequired!: boolean;
  @Column({ type: 'int', default: 0 }) position!: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
