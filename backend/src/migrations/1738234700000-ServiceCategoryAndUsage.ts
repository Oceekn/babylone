import { MigrationInterface, QueryRunner } from 'typeorm';

export class ServiceCategoryAndUsage1738234700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
