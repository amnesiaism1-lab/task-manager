import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('dashboard_widgets')
export class DashboardWidget {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'dashboard_id', type: 'uuid' }) dashboardId!: string;
  @Column({ name: 'saved_filter_id', type: 'uuid', nullable: true }) savedFilterId!: string | null;
  @Column({ name: 'widget_type', length: 64 }) widgetType!: string;
  @Column({ name: 'config_json', type: 'jsonb', default: {} }) configJson!: Record<string, unknown>;
  @Column({ type: 'int', default: 0 }) position!: number;
  @Column({ type: 'int', default: 1 }) version!: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}