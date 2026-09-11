import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('issue_custom_field_values')
export class IssueCustomFieldValue {
  @PrimaryColumn({ name: 'issue_id', type: 'uuid' }) issueId!: string;
  @PrimaryColumn({ name: 'custom_field_context_id', type: 'uuid' }) customFieldContextId!: string;
  @Column({ name: 'value_json', type: 'jsonb' }) valueJson!: unknown;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
