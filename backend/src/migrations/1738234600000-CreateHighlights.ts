import { MigrationInterface, QueryRunner } from 'typeorm';

function getRows(result: unknown): unknown[] {
  return Array.isArray(result) ? result : (result as { rows?: unknown[] })?.rows ?? [];
}

export class CreateHighlights1738234600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const r = await queryRunner.query(`SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'babylone' AND table_name = 'users') as exists`);
    if (!getRows(r)[0] || !(getRows(r)[0] as { exists?: boolean }).exists) return;
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS babylone.highlights (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES babylone.users(id) ON DELETE CASCADE,
        title varchar(100) NOT NULL,
        created_at timestamp NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_highlights_user_id ON babylone.highlights(user_id);`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS babylone.highlight_stories (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        highlight_id uuid NOT NULL REFERENCES babylone.highlights(id) ON DELETE CASCADE,
        story_id uuid NOT NULL REFERENCES babylone.stories(id) ON DELETE CASCADE,
        position int NOT NULL DEFAULT 0,
        UNIQUE(highlight_id, story_id)
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_highlight_stories_highlight_id ON babylone.highlight_stories(highlight_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_highlight_stories_story_id ON babylone.highlight_stories(story_id);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS babylone.highlight_stories;`);
    await queryRunner.query(`DROP TABLE IF EXISTS babylone.highlights;`);
  }
}
