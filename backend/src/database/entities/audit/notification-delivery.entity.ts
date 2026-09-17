import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('notification_deliveries')
@Index(['notificationId', 'channel'], { unique: true })
export class NotificationDelivery {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'notification_id', type: 'uuid' }) notificationId!: string;
  @Column({ length: 32 }) channel!: 'email' | 'in_app';
  @Column({ length: 32, default: 'pending' }) status!: 'pending' | 'sent' | 'failed';
  @Column({ type: 'varchar', length: 320, nullable: true }) destination!: string | null;
  @Column({ type: 'int', default: 0 }) attempts!: number;
  @Column({ name: 'last_error', type: 'text', nullable: true }) lastError!: string | null;
  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true }) sentAt!: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}