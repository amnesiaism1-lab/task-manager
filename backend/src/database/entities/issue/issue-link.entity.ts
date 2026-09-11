import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('issue_links')
@Index(['issueId', 'linkedIssueId', 'linkTypeId'], { unique: true })
export class IssueLink {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'org_id', type: 'uuid' }) orgId!: string;
  @Column({ name: 'issue_id', type: 'uuid' }) issueId!: string;
  @Column({ name: 'linked_issue_id', type: 'uuid' }) linkedIssueId!: string;
  @Column({ name: 'link_type_id', type: 'uuid' }) linkTypeId!: string;
  @Column({ name: 'created_by_member_id', type: 'uuid' }) createdByMemberId!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
