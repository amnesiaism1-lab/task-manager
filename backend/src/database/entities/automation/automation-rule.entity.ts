import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('automation_rules')
export class AutomationRule {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'org_id', type: 'uuid' }) orgId!: string;
  @Column({ name: 'project_id', type: 'uuid', nullable: true }) projectId!: string | null;
  @Column({ name: 'created_by_member_id', type: 'uuid' }) createdByMemberId!: string;
  @Column({ length: 160 }) name!: string;
  @Column({ type: 'int', default: 1 }) version!: number;
  @Column({ length: 32, default: 'draft' }) status!: 'draft' | 'active' | 'disabled';
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}