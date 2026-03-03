import { MigrationInterface, QueryRunner } from 'typeorm';

function getRows(result: unknown): unknown[] {
  return Array.isArray(result) ? result : (result as { rows?: unknown[] })?.rows ?? [];
}

export class ServiceCategoryAndUsage1738234700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const r = await queryRunner.query(`SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'babylone' AND table_name = 'services') as exists`);
    if (!getRows(r)[0] || !(getRows(r)[0] as { exists?: boolean }).exists) return;
    await queryRunner.query(`
      ALTER TABLE babylone.services
      ADD COLUMN IF NOT EXISTS category varchar(100) NULL;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS babylone.category_usage (
        name varchar(100) PRIMARY KEY,
        count int NOT NULL DEFAULT 0
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS babylone.category_usage;`);
    await queryRunner.query(`ALTER TABLE babylone.services DROP COLUMN IF EXISTS category;`);
  }
}
