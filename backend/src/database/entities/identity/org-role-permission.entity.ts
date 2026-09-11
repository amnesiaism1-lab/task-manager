import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('org_role_permission_entries')
export class OrganizationRolePermission {
  @PrimaryColumn({ name: 'role_id', type: 'uuid' }) roleId!: string;
  @PrimaryColumn({ name: 'permission_key', length: 100 }) permissionKey!: string;
  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }) createdAt!: Date;
}
