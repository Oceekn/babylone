import { MigrationInterface, QueryRunner } from 'typeorm';

function getRows(result: unknown): unknown[] {
  return Array.isArray(result) ? result : (result as { rows?: unknown[] })?.rows ?? [];
}

export class CreateFollows1738234800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const r = await queryRunner.query(`SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'babylone' AND table_name = 'users') as exists`);
    if (!getRows(r)[0] || !(getRows(r)[0] as { exists?: boolean }).exists) return;
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS babylone.follows (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        follower_id uuid NOT NULL REFERENCES babylone.users(id) ON DELETE CASCADE,
        following_id uuid NOT NULL REFERENCES babylone.users(id) ON DELETE CASCADE,
        created_at timestamp NOT NULL DEFAULT now(),
        UNIQUE(follower_id, following_id)
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON babylone.follows(follower_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_follows_following_id ON babylone.follows(following_id);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS babylone.follows;`);
  }
}
