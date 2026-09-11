import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('project_versions')
@Index(['projectId', 'name'], { unique: true })
export class ProjectVersion {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'project_id', type: 'uuid' }) projectId!: string;
  @Column({ length: 160 }) name!: string;
  @Column({ type: 'text', nullable: true }) description!: string | null;
  @Column({ name: 'release_date', type: 'timestamptz', nullable: true }) releaseDate!: Date | null;
  @Column({ length: 32, default: 'unreleased' }) status!: 'unreleased' | 'released' | 'archived';
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
  @Column({ name: 'released_at', type: 'timestamptz', nullable: true }) releasedAt!: Date | null;
}