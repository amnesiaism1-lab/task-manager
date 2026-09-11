import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('issue_security_grants')
export class IssueSecurityGrant {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'level_id', type: 'uuid' }) levelId!: string;
  @Column({ name: 'grant_type', length: 32 }) grantType!: string;
  @Column({ name: 'org_member_id', type: 'uuid', nullable: true }) orgMemberId!: string | null;
  @Column({ name: 'group_id', type: 'uuid', nullable: true }) groupId!: string | null;
  @Column({ name: 'project_role_key', type: 'varchar', length: 64, nullable: true }) projectRoleKey!: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}