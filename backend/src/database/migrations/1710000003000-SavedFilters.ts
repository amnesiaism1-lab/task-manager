import { MigrationInterface, QueryRunner } from 'typeorm';

export class SavedFilters1710000003000 implements MigrationInterface {
  name = 'SavedFilters1710000003000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS saved_filters (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid NOT NULL REFERENCES organizations(id), owner_member_id uuid NOT NULL REFERENCES organization_members(id), name varchar(160) NOT NULL, description text, query_language varchar(32) NOT NULL DEFAULT 'ast-json', query_text text NOT NULL, version int NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), archived_at timestamptz)`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS saved_filters_owner_name_uq ON saved_filters(owner_member_id,name) WHERE archived_at IS NULL`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS filter_shares (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), filter_id uuid NOT NULL REFERENCES saved_filters(id) ON DELETE CASCADE, grantee_type varchar(32) NOT NULL, project_id uuid, group_id uuid, org_member_id uuid, project_role_key varchar(64), can_edit boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now())`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS filter_subscriptions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), filter_id uuid NOT NULL REFERENCES saved_filters(id) ON DELETE CASCADE, subscriber_member_id uuid NOT NULL REFERENCES organization_members(id), cron_expression varchar(120) NOT NULL, timezone varchar(80) NOT NULL DEFAULT 'UTC', is_active boolean NOT NULL DEFAULT true, next_run_at timestamptz, last_run_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(filter_id,subscriber_member_id))`);
  }
  async down(queryRunner: QueryRunner): Promise<void> { await queryRunner.query('DROP TABLE IF EXISTS filter_subscriptions'); await queryRunner.query('DROP TABLE IF EXISTS filter_shares'); await queryRunner.query('DROP TABLE IF EXISTS saved_filters'); }
}