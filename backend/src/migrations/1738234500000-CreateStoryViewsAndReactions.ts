import { MigrationInterface, QueryRunner } from 'typeorm';

function getRows(result: unknown): unknown[] {
  return Array.isArray(result) ? result : (result as { rows?: unknown[] })?.rows ?? [];
}

export class CreateStoryViewsAndReactions1738234500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const r = await queryRunner.query(`SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'babylone' AND table_name = 'stories') as exists`);
    if (!getRows(r)[0] || !(getRows(r)[0] as { exists?: boolean }).exists) return;
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS babylone.story_views (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        story_id uuid NOT NULL REFERENCES babylone.stories(id) ON DELETE CASCADE,
        user_id uuid NOT NULL REFERENCES babylone.users(id) ON DELETE CASCADE,
        viewed_at timestamp NOT NULL DEFAULT now(),
        UNIQUE(story_id, user_id)
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON babylone.story_views(story_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_story_views_user_id ON babylone.story_views(user_id);`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS babylone.story_reactions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        story_id uuid NOT NULL REFERENCES babylone.stories(id) ON DELETE CASCADE,
        user_id uuid NOT NULL REFERENCES babylone.users(id) ON DELETE CASCADE,
        emoji varchar(16) NOT NULL,
        created_at timestamp NOT NULL DEFAULT now(),
        UNIQUE(story_id, user_id)
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_story_reactions_story_id ON babylone.story_reactions(story_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_story_reactions_user_id ON babylone.story_reactions(user_id);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS babylone.story_reactions;`);
    await queryRunner.query(`DROP TABLE IF EXISTS babylone.story_views;`);
  }
}
