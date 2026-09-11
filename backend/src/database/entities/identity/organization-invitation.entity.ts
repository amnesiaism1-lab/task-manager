import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('organization_invitations')
@Index(['orgId', 'email', 'status'])
export class OrganizationInvitation {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'org_id', type: 'uuid' }) orgId!: string;
  @Column({ length: 320 }) email!: string;
  @Column({ name: 'invited_by_member_id', type: 'uuid' }) invitedByMemberId!: string;
  @Column({ name: 'org_role_id', type: 'uuid', nullable: true }) orgRoleId!: string | null;
  @Column({ name: 'token_hash', unique: true, length: 64 }) tokenHash!: string;
  @Column({ length: 32, default: 'pending' }) status!: 'pending' | 'accepted' | 'revoked' | 'expired';
  @Column({ name: 'expires_at', type: 'timestamptz' }) expiresAt!: Date;
  @Column({ name: 'accepted_by_user_id', type: 'uuid', nullable: true }) acceptedByUserId!: string | null;
  @Column({ name: 'accepted_at', type: 'timestamptz', nullable: true }) acceptedAt!: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
