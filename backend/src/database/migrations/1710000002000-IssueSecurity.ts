import { MigrationInterface, QueryRunner } from 'typeorm';

export class IssueSecurity1710000002000 implements MigrationInterface {
  name = 'IssueSecurity1710000002000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS issue_security_scheme_id uuid`);
    await queryRunner.query(`ALTER TABLE issues ADD COLUMN IF NOT EXISTS security_level_id uuid`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS issue_security_schemes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid NOT NULL REFERENCES organizations(id), name varchar(160) NOT NULL, description text, default_level_id uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(org_id,name))`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS issue_security_levels (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), scheme_id uuid NOT NULL REFERENCES issue_security_schemes(id) ON DELETE CASCADE, name varchar(160) NOT NULL, description text, position int NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(scheme_id,name), UNIQUE(scheme_id,position))`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS issue_security_grants (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), level_id uuid NOT NULL REFERENCES issue_security_levels(id) ON DELETE CASCADE, grant_type varchar(32) NOT NULL, org_member_id uuid REFERENCES organization_members(id), group_id uuid REFERENCES groups(id), project_role_key varchar(64), created_at timestamptz NOT NULL DEFAULT now())`);
    await queryRunner.query(`ALTER TABLE issue_security_schemes ADD CONSTRAINT issue_security_schemes_default_level_fk FOREIGN KEY (default_level_id) REFERENCES issue_security_levels(id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS issue_security_grants_level_idx ON issue_security_grants(level_id)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS issue_security_grants`);
    await queryRunner.query(`DROP TABLE IF EXISTS issue_security_levels`);
    await queryRunner.query(`DROP TABLE IF EXISTS issue_security_schemes`);
    await queryRunner.query(`ALTER TABLE issues DROP COLUMN IF EXISTS security_level_id`);
    await queryRunner.query(`ALTER TABLE projects DROP COLUMN IF EXISTS issue_security_scheme_id`);
  }
}