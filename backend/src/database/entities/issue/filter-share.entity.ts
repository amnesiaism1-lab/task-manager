import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('filter_shares')
export class FilterShare {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'filter_id', type: 'uuid' }) filterId!: string;
  @Column({ name: 'grantee_type', length: 32 }) granteeType!: string;
  @Column({ name: 'project_id', type: 'uuid', nullable: true }) projectId!: string | null;
  @Column({ name: 'group_id', type: 'uuid', nullable: true }) groupId!: string | null;
  @Column({ name: 'org_member_id', type: 'uuid', nullable: true }) orgMemberId!: string | null;
  @Column({ name: 'project_role_key', type: 'varchar', length: 64, nullable: true }) projectRoleKey!: string | null;
  @Column({ name: 'can_edit', default: false }) canEdit!: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}