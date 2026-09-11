import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('webhook_subscriptions')
export class WebhookSubscription {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'org_id', type: 'uuid' }) orgId!: string;
  @Column({ name: 'project_id', type: 'uuid', nullable: true }) projectId!: string | null;
  @Column({ name: 'created_by_member_id', type: 'uuid' }) createdByMemberId!: string;
  @Column({ length: 2048 }) url!: string;
  @Column({ name: 'secret_hash', length: 64 }) secretHash!: string;
  @Column({ type: 'jsonb', default: [] }) events!: string[];
  @Column({ name: 'filter_json', type: 'jsonb', default: {} }) filterJson!: Record<string, unknown>;
  @Column({ length: 32, default: 'active' }) status!: 'active' | 'paused' | 'disabled';
  @Column({ name: 'failure_count', type: 'int', default: 0 }) failureCount!: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}