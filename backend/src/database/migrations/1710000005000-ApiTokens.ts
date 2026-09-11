import { MigrationInterface, QueryRunner } from 'typeorm';

export class ApiTokens1710000005000 implements MigrationInterface {
  name = 'ApiTokens1710000005000';
  async up(queryRunner: QueryRunner): Promise<void> { await queryRunner.query(`CREATE TABLE IF NOT EXISTS api_tokens (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid NOT NULL REFERENCES organizations(id), member_id uuid NOT NULL REFERENCES organization_members(id), name varchar(160) NOT NULL, token_hash varchar(64) NOT NULL, scopes jsonb NOT NULL DEFAULT '[]', expires_at timestamptz, last_used_at timestamptz, revoked_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(org_id,token_hash))`); }
  async down(queryRunner: QueryRunner): Promise<void> { await queryRunner.query('DROP TABLE IF EXISTS api_tokens'); }
}