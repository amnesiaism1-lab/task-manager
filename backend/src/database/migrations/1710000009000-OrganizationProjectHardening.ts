import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrganizationProjectHardening1710000009000 implements MigrationInterface {
  name = 'OrganizationProjectHardening1710000009000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS project_components (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES projects(id), name varchar(120) NOT NULL, description text, lead_member_id uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), archived_at timestamptz)`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_project_components_name ON project_components(project_id, name)`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS project_versions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES projects(id), name varchar(160) NOT NULL, description text, release_date timestamptz, status varchar(32) NOT NULL DEFAULT 'unreleased', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), released_at timestamptz)`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_project_versions_name ON project_versions(project_id, name)`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_pending_org_invitation_email ON organization_invitations(org_id, lower(email)) WHERE status = 'pending'`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_active_sprint_per_board ON sprints(board_id) WHERE state = 'active'`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_board_issue_rank ON board_issue_positions(board_id, rank)`);
    await queryRunner.query(`ALTER TABLE projects ADD CONSTRAINT projects_visibility_check CHECK (visibility IN ('private', 'org', 'public'))`);
    await queryRunner.query(`ALTER TABLE project_versions ADD CONSTRAINT project_versions_status_check CHECK (status IN ('unreleased', 'released', 'archived'))`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS project_versions');
    await queryRunner.query('DROP TABLE IF EXISTS project_components');
  }
}