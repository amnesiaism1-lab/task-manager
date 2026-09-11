import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('board_issue_positions')
export class BoardIssuePosition {
  @PrimaryColumn({ name: 'board_id', type: 'uuid' }) boardId!: string;
  @PrimaryColumn({ name: 'issue_id', type: 'uuid' }) issueId!: string;
  @Column({ length: 255 }) rank!: string;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
