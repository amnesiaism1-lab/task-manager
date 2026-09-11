import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permission_scheme_entries')
export class PermissionSchemeEntry {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'scheme_id', type: 'uuid' }) schemeId!: string;
  @Column({ name: 'permission_key', length: 100 }) permissionKey!: string;
  @Column({ name: 'project_role_id', type: 'uuid' }) projectRoleId!: string;
}
