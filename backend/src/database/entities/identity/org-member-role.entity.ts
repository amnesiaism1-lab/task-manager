import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('org_member_roles')
export class OrganizationMemberRole {
  @PrimaryColumn({ name: 'org_member_id', type: 'uuid' }) orgMemberId!: string;
  @PrimaryColumn({ name: 'role_id', type: 'uuid' }) roleId!: string;
  @Column({ name: 'granted_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }) grantedAt!: Date;
  @Column({ name: 'granted_by_member_id', type: 'uuid', nullable: true }) grantedByMemberId!: string | null;
}
