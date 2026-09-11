import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('api_tokens')
@Index(['orgId', 'tokenHash'], { unique: true })
export class ApiToken {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'org_id', type: 'uuid' }) orgId!: string;
  @Column({ name: 'member_id', type: 'uuid' }) memberId!: string;
  @Column({ length: 160 }) name!: string;
  @Column({ name: 'token_hash', length: 64 }) tokenHash!: string;
  @Column({ type: 'jsonb', default: [] }) scopes!: string[];
  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true }) expiresAt!: Date | null;
  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true }) lastUsedAt!: Date | null;
  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true }) revokedAt!: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}