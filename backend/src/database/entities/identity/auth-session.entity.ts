import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('auth_sessions')
export class AuthSession {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'user_id', type: 'uuid' }) userId!: string;
  @Column({ name: 'refresh_token_hash', unique: true, length: 64 }) refreshTokenHash!: string;
  @Column({ length: 32, default: 'active' }) status!: 'active' | 'revoked' | 'expired';
  @Column({ name: 'ip_address', type: 'varchar', length: 64, nullable: true }) ipAddress!: string | null;
  @Column({ name: 'user_agent', type: 'text', nullable: true }) userAgent!: string | null;
  @Column({ name: 'expires_at', type: 'timestamptz' }) expiresAt!: Date;
  @Column({ name: 'last_seen_at', type: 'timestamptz', nullable: true }) lastSeenAt!: Date | null;
  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true }) revokedAt!: Date | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
