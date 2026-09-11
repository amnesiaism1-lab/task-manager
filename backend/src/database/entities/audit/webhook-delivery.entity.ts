import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('webhook_deliveries')
@Index(['subscriptionId', 'eventId'], { unique: true })
export class WebhookDelivery {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'subscription_id', type: 'uuid' }) subscriptionId!: string;
  @Column({ name: 'event_id', type: 'uuid' }) eventId!: string;
  @Column({ length: 32, default: 'pending' }) status!: 'pending' | 'success' | 'failed';
  @Column({ type: 'int', default: 0 }) attempts!: number;
  @Column({ name: 'next_attempt_at', type: 'timestamptz', nullable: true }) nextAttemptAt!: Date | null;
  @Column({ name: 'response_status', type: 'int', nullable: true }) responseStatus!: number | null;
  @Column({ name: 'last_error', type: 'text', nullable: true }) lastError!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}