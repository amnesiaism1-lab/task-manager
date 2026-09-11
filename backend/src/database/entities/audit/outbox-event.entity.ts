import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('outbox_events')
@Index(['status', 'occurredAt'])
@Index(['orgId', 'idempotencyKey'], { unique: true })
export class OutboxEvent {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'org_id', type: 'uuid' }) orgId!: string;
  @Column({ name: 'aggregate_type', length: 64 }) aggregateType!: string;
  @Column({ name: 'aggregate_id', type: 'uuid' }) aggregateId!: string;
  @Column({ name: 'event_type', length: 120 }) eventType!: string;
  @Column({ name: 'payload_json', type: 'jsonb' }) payloadJson!: Record<string, unknown>;
  @Column({ length: 32, default: 'pending' }) status!: 'pending' | 'published' | 'failed';
  @Column({ name: 'idempotency_key', length: 180 }) idempotencyKey!: string;
  @CreateDateColumn({ name: 'occurred_at', type: 'timestamptz' }) occurredAt!: Date;
  @Column({ name: 'published_at', type: 'timestamptz', nullable: true }) publishedAt!: Date | null;
  @Column({ name: 'retry_count', type: 'int', default: 0 }) retryCount!: number;
  @Column({ name: 'last_error', type: 'text', nullable: true }) lastError!: string | null;
}
