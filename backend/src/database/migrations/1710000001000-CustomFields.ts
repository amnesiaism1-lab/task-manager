import { MigrationInterface, QueryRunner } from 'typeorm';

export class CustomFields1710000001000 implements MigrationInterface {
  name = 'CustomFields1710000001000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS attachments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid NOT NULL REFERENCES organizations(id), issue_id uuid NOT NULL REFERENCES issues(id), comment_id uuid, uploaded_by_member_id uuid NOT NULL, file_name varchar(255) NOT NULL, mime_type varchar(160) NOT NULL, file_size bigint NOT NULL, storage_provider varchar(32) NOT NULL DEFAULT 'local', storage_key varchar(500) NOT NULL UNIQUE, checksum varchar(128) NOT NULL, deleted_at timestamptz, created_at timestamptz NOT NULL DEFAULT now())`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS custom_fields (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid NOT NULL REFERENCES organizations(id), key varchar(64) NOT NULL, name varchar(120) NOT NULL, field_type varchar(32) NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(org_id,key))`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS custom_field_contexts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), custom_field_id uuid NOT NULL REFERENCES custom_fields(id), project_id uuid NOT NULL REFERENCES projects(id), issue_type_id uuid NOT NULL REFERENCES issue_types(id), is_required boolean NOT NULL DEFAULT false, position int NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(custom_field_id,project_id,issue_type_id))`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS custom_field_options (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), custom_field_id uuid NOT NULL REFERENCES custom_fields(id), value varchar(120) NOT NULL, label varchar(160) NOT NULL, position int NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now())`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS issue_custom_field_values (issue_id uuid NOT NULL REFERENCES issues(id), custom_field_context_id uuid NOT NULL REFERENCES custom_field_contexts(id), value_json jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(issue_id,custom_field_context_id))`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS attachments CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS issue_custom_field_values CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS custom_field_options CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS custom_field_contexts CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS custom_fields CASCADE');
  }
}
