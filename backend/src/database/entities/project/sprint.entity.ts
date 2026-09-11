import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sprints')
export class Sprint {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'project_id', type: 'uuid' }) projectId!: string;
  @Column({ name: 'board_id', type: 'uuid' }) boardId!: string;
  @Column({ length: 160 }) name!: string;
  @Column({ type: 'text', nullable: true }) goal!: string | null;
  @Column({ length: 32, default: 'planned' }) state!: 'planned' | 'active' | 'closed';
  @Column({ name: 'start_at', type: 'timestamptz', nullable: true }) startAt!: Date | null;
  @Column({ name: 'end_at', type: 'timestamptz', nullable: true }) endAt!: Date | null;
  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true }) closedAt!: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
