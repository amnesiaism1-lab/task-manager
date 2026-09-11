import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Add is_system_admin flag to users table.
 * Supports UC-SYS-01 (Global User Management) and UC-SYS-02 (Global Org Management)
 * as defined in SRS v1.7 F-SYS-01/F-SYS-02.
 */
export class SystemAdmin1710000010000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_system_admin BOOLEAN NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_is_system_admin
      ON users (is_system_admin)
      WHERE is_system_admin = true
    `);

    await queryRunner.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
      ALTER TABLE users ADD CONSTRAINT users_status_check 
      CHECK (status::text = ANY (ARRAY['active'::character varying, 'deactivated'::character varying, 'suspended'::character varying]::text[]));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_is_system_admin`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS is_system_admin`);
    await queryRunner.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
      ALTER TABLE users ADD CONSTRAINT users_status_check 
      CHECK (status::text = ANY (ARRAY['active'::character varying, 'deactivated'::character varying]::text[]));
    `);
  }
}
