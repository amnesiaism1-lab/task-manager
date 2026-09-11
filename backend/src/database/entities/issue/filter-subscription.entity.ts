import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('filter_subscriptions')
export class FilterSubscription {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'filter_id', type: 'uuid' }) filterId!: string;
  @Column({ name: 'subscriber_member_id', type: 'uuid' }) subscriberMemberId!: string;
  @Column({ name: 'cron_expression', length: 120 }) cronExpression!: string;
  @Column({ length: 80, default: 'UTC' }) timezone!: string;
  @Column({ name: 'is_active', default: true }) isActive!: boolean;
  @Column({ name: 'next_run_at', type: 'timestamptz', nullable: true }) nextRunAt!: Date | null;
  @Column({ name: 'last_run_at', type: 'timestamptz', nullable: true }) lastRunAt!: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}