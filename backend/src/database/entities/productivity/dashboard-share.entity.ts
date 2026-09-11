import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('dashboard_shares')
export class DashboardShare {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'dashboard_id', type: 'uuid' }) dashboardId!: string;
  @Column({ name: 'grantee_type', length: 32 }) granteeType!: string;
  @Column({ name: 'org_member_id', type: 'uuid', nullable: true }) orgMemberId!: string | null;
  @Column({ name: 'project_id', type: 'uuid', nullable: true }) projectId!: string | null;
  @Column({ name: 'can_edit', default: false }) canEdit!: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}