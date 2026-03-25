import { MigrationInterface, QueryRunner } from 'typeorm';

function getRows(result: unknown): unknown[] {
  return Array.isArray(result) ? result : (result as { rows?: unknown[] })?.rows ?? [];
}

export class ContactsDmAndGroupPrivacy1738235000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const r = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'babylone' AND table_name = 'users') as exists`,
    );
    if (!getRows(r)[0] || !(getRows(r)[0] as { exists?: boolean }).exists) return;

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS babylone.user_contact_phones (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES babylone.users(id) ON DELETE CASCADE,
        phone_e164 varchar(24) NOT NULL,
        created_at timestamp NOT NULL DEFAULT now(),
        UNIQUE(user_id, phone_e164)
      );
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_user_contact_phones_user_id ON babylone.user_contact_phones(user_id);`,
    );

    await queryRunner.query(`
      ALTER TABLE babylone.users
        ADD COLUMN IF NOT EXISTS privacy_group_invite varchar(20) NOT NULL DEFAULT 'dm_only';
    `);

    await queryRunner.query(`
      UPDATE babylone.users SET privacy_dm_from = 'contacts_or_follow' WHERE privacy_dm_from = 'everyone';
    `);
    await queryRunner.query(`
      ALTER TABLE babylone.users
        ALTER COLUMN privacy_dm_from SET DEFAULT 'contacts_or_follow';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS babylone.user_contact_phones;`);
    await queryRunner.query(`ALTER TABLE babylone.users DROP COLUMN IF EXISTS privacy_group_invite;`);
  }
}
