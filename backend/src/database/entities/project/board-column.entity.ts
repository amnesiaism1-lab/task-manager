import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('board_columns')
@Index(['boardId', 'position'], { unique: true })
export class BoardColumn {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'board_id', type: 'uuid' }) boardId!: string;
  @Column({ length: 120 }) name!: string;
  @Column({ type: 'int' }) position!: number;
  @Column({ name: 'wip_limit', type: 'int', nullable: true }) wipLimit!: number | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
