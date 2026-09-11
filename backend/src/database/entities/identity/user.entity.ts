import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true, length: 320 }) email!: string;
  @Column({ name: 'password_hash', length: 255 }) passwordHash!: string;
  @Column({ name: 'full_name', length: 160 }) fullName!: string;
  @Column({ name: 'avatar_url', type: 'text', nullable: true }) avatarUrl!: string | null;
  @Column({ length: 32, default: 'active' }) status!: 'active' | 'deactivated' | 'suspended';
  @Column({ name: 'email_verified_at', type: 'timestamptz', nullable: true }) emailVerifiedAt!: Date | null;
  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true }) lastLoginAt!: Date | null;
  /** Platform-level System Admin flag. See SRS UC-SYS-01/02. Set via DB seeding or dedicated admin tooling. */
  @Column({ name: 'is_system_admin', type: 'boolean', default: false }) isSystemAdmin!: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}
