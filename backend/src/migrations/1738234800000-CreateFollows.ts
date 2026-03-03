import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFollows1738234800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
