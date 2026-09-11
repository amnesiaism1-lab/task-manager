import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('activity_logs')
@Index(['orgId', 'createdAt'])
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'org_id', type: 'uuid' }) orgId!: string;
  @Column({ name: 'actor_type', length: 32, default: 'member' }) actorType!: 'member' | 'system';
  @Column({ name: 'actor_member_id', type: 'uuid', nullable: true }) actorMemberId!: string | null;
  @Column({ name: 'project_id', type: 'uuid', nullable: true }) projectId!: string | null;
  @Column({ name: 'issue_id', type: 'uuid', nullable: true }) issueId!: string | null;
  @Column({ name: 'event_type', length: 120 }) eventType!: string;
  @Column({ name: 'payload_json', type: 'jsonb', default: {} }) payloadJson!: Record<string, unknown>;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
