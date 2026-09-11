import { Column, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'organization_members' })
@Index(['orgId', 'userId'], { unique: true })
export class OrganizationMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'org_id', type: 'uuid' })
  orgId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', default: 'invited' })
  status!: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  title!: string | null;

  @Column({ name: 'joined_at', type: 'timestamptz', nullable: true })
  joinedAt!: Date | null;

  @Column({ name: 'invited_by_member_id', type: 'uuid', nullable: true })
  invitedByMemberId!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
