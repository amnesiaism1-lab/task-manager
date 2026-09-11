import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('dashboards')
export class Dashboard {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'org_id', type: 'uuid' }) orgId!: string;
  @Column({ name: 'owner_member_id', type: 'uuid' }) ownerMemberId!: string;
  @Column({ length: 160 }) name!: string;
  @Column({ type: 'text', nullable: true }) description!: string | null;
  @Column({ length: 32, default: 'active' }) status!: 'active' | 'archived';
  @Column({ type: 'int', default: 1 }) version!: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}