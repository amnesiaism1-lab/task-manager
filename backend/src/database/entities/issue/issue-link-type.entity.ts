import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('issue_link_types')
@Index(['orgId', 'key'], { unique: true })
export class IssueLinkType {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'org_id', type: 'uuid' }) orgId!: string;
  @Column({ length: 64 }) key!: string;
  @Column({ name: 'outward_label', length: 120 }) outwardLabel!: string;
  @Column({ name: 'inward_label', length: 120 }) inwardLabel!: string;
  @Column({ length: 32, default: 'directed' }) directionality!: 'directed' | 'symmetric';
  @Column({ name: 'archived_at', type: 'timestamptz', nullable: true }) archivedAt!: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
