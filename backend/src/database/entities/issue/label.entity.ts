import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('labels')
@Index(['orgId', 'name'], { unique: true })
export class Label {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'org_id', type: 'uuid' }) orgId!: string;
  @Column({ length: 120 }) name!: string;
  @Column({ name: 'archived_at', type: 'timestamptz', nullable: true }) archivedAt!: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
