import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('department_members')
export class DepartmentMember {
  @PrimaryColumn({ name: 'department_id', type: 'uuid' }) departmentId!: string;
  @PrimaryColumn({ name: 'org_member_id', type: 'uuid' }) orgMemberId!: string;
  @Column({ name: 'role_in_department', type: 'varchar', length: 80, nullable: true }) roleInDepartment!: string | null;
  @Column({ name: 'joined_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }) joinedAt!: Date;
}
