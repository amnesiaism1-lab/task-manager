import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('project_member_roles')
export class ProjectMemberRole {
  @PrimaryColumn({ name: 'project_member_id', type: 'uuid' }) projectMemberId!: string;
  @PrimaryColumn({ name: 'project_role_id', type: 'uuid' }) projectRoleId!: string;
  @Column({ name: 'granted_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }) grantedAt!: Date;
  @Column({ name: 'granted_by_member_id', type: 'uuid', nullable: true }) grantedByMemberId!: string | null;
}
