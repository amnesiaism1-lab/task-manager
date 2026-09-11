import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryColumn({ name: 'org_id', type: 'uuid' }) orgId!: string;
  @PrimaryColumn({ name: 'member_id', type: 'uuid' }) memberId!: string;
  @PrimaryColumn({ name: 'notification_type', length: 120 }) notificationType!: string;
  @PrimaryColumn({ length: 32 }) channel!: 'in_app' | 'email';
  @Column({ default: true }) enabled!: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}