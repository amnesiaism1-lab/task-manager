import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('auth_audit_logs')
@Index(['userId', 'createdAt'])
export class AuthAuditLog {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'user_id', type: 'uuid', nullable: true }) userId!: string | null;
  @Column({ name: 'event_type', length: 80 }) eventType!: string;
  @Column({ name: 'ip_address', type: 'varchar', length: 64, nullable: true }) ipAddress!: string | null;
  @Column({ name: 'metadata_json', type: 'jsonb', default: {} }) metadataJson!: Record<string, unknown>;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}