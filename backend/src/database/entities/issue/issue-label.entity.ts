import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('issue_labels')
export class IssueLabel {
  @PrimaryColumn({ name: 'issue_id', type: 'uuid' }) issueId!: string;
  @PrimaryColumn({ name: 'label_id', type: 'uuid' }) labelId!: string;
  @Column({ name: 'added_by_member_id', type: 'uuid' }) addedByMemberId!: string;
  @Column({ name: 'added_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }) addedAt!: Date;
}
