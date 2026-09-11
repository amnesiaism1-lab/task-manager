import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('project_members')
@Index(['projectId', 'orgMemberId'], { unique: true })
export class ProjectMember {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'project_id', type: 'uuid' }) projectId!: string;
  @Column({ name: 'org_member_id', type: 'uuid' }) orgMemberId!: string;
  @Column({ length: 32, default: 'active' }) status!: 'active' | 'removed';
  @Column({ name: 'joined_at', type: 'timestamptz', nullable: true }) joinedAt!: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
