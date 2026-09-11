import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthHardening1710000008000 implements MigrationInterface {
  name = 'AuthHardening1710000008000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS auth_audit_logs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES users(id), event_type varchar(80) NOT NULL, ip_address varchar(64), metadata_json jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now())`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_auth_audit_logs_user_created ON auth_audit_logs(user_id, created_at)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_status ON auth_sessions(user_id, status)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_expiry ON email_verification_tokens(user_id, expires_at)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_expiry ON password_reset_tokens(user_id, expires_at)`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_lower ON users(lower(email))`);
    await queryRunner.query(`ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('active', 'deactivated'))`);
    await queryRunner.query(`ALTER TABLE auth_sessions ADD CONSTRAINT auth_sessions_status_check CHECK (status IN ('active', 'revoked', 'expired'))`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS auth_audit_logs');
  }
}