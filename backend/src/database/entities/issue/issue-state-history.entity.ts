import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('issue_state_history')
export class IssueStateHistory {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'org_id', type: 'uuid' }) orgId!: string;
  @Column({ name: 'issue_id', type: 'uuid' }) issueId!: string;
  @Column({ name: 'from_state_id', type: 'uuid' }) fromStateId!: string;
  @Column({ name: 'to_state_id', type: 'uuid' }) toStateId!: string;
  @Column({ name: 'transition_id', type: 'uuid' }) transitionId!: string;
  @Column({ name: 'actor_member_id', type: 'uuid' }) actorMemberId!: string;
  @Column({ name: 'comment', type: 'text', nullable: true }) comment!: string | null;
  @Column({ name: 'idempotency_key', type: 'varchar', length: 180, nullable: true }) idempotencyKey!: string | null;
  @Column({ name: 'version_before', type: 'int' }) versionBefore!: number;
  @Column({ name: 'version_after', type: 'int' }) versionAfter!: number;
  @CreateDateColumn({ name: 'occurred_at', type: 'timestamptz' }) occurredAt!: Date;
}
