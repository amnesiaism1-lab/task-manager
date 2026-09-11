import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('group_members')
export class GroupMember {
  @PrimaryColumn({ name: 'group_id', type: 'uuid' }) groupId!: string;
  @PrimaryColumn({ name: 'org_member_id', type: 'uuid' }) orgMemberId!: string;
  @Column({ name: 'added_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }) addedAt!: Date;
  @Column({ name: 'added_by_member_id', type: 'uuid', nullable: true }) addedByMemberId!: string | null;
}
