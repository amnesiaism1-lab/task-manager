import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notifications')
@Index(['recipientMemberId', 'readAt'])
@Index(['outboxEventId', 'recipientMemberId', 'notificationType'], { unique: true })
export class Notification {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'org_id', type: 'uuid' }) orgId!: string;
  @Column({ name: 'recipient_member_id', type: 'uuid' }) recipientMemberId!: string;
  @Column({ name: 'outbox_event_id', type: 'uuid' }) outboxEventId!: string;
  @Column({ name: 'notification_type', length: 120 }) notificationType!: string;
  @Column({ length: 200 }) title!: string;
  @Column({ type: 'text' }) body!: string;
  @Column({ name: 'data_json', type: 'jsonb', default: {} }) dataJson!: Record<string, unknown>;
  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true }) sentAt!: Date | null;
  @Column({ name: 'read_at', type: 'timestamptz', nullable: true }) readAt!: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
