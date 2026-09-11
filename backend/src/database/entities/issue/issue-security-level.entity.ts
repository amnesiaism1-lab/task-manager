import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('issue_security_levels')
export class IssueSecurityLevel {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'scheme_id', type: 'uuid' }) schemeId!: string;
  @Column({ length: 160 }) name!: string;
  @Column({ type: 'text', nullable: true }) description!: string | null;
  @Column({ type: 'int', default: 0 }) position!: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}