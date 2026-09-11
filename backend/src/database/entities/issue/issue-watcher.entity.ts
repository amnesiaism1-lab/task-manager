import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('issue_watchers')
export class IssueWatcher {
  @PrimaryColumn({ name: 'issue_id', type: 'uuid' }) issueId!: string;
  @PrimaryColumn({ name: 'org_member_id', type: 'uuid' }) orgMemberId!: string;
  @Column({ name: 'added_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }) addedAt!: Date;
}
