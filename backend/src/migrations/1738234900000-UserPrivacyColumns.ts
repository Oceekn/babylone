import { MigrationInterface, QueryRunner } from 'typeorm';

function getRows(result: unknown): unknown[] {
  return Array.isArray(result) ? result : (result as { rows?: unknown[] })?.rows ?? [];
}

export class UserPrivacyColumns1738234900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const r = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'babylone' AND table_name = 'users') as exists`,
    );
    if (!getRows(r)[0] || !(getRows(r)[0] as { exists?: boolean }).exists) return;

    await queryRunner.query(`
      ALTER TABLE babylone.users
        ADD COLUMN IF NOT EXISTS privacy_dm_from varchar(20) NOT NULL DEFAULT 'everyone';
    `);
    await queryRunner.query(`
      ALTER TABLE babylone.users
        ADD COLUMN IF NOT EXISTS privacy_status_visibility varchar(20) NOT NULL DEFAULT 'everyone';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE babylone.users DROP COLUMN IF EXISTS privacy_status_visibility;`);
    await queryRunner.query(`ALTER TABLE babylone.users DROP COLUMN IF EXISTS privacy_dm_from;`);
  }
}
