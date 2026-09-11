import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'project_id', type: 'uuid' }) projectId!: string;
  @Column({ name: 'board_type', length: 32, default: 'kanban' }) boardType!: 'kanban' | 'scrum';
  @Column({ length: 160 }) name!: string;
  @Column({ type: 'text', nullable: true }) description!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
