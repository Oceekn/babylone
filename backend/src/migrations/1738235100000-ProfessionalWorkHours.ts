import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProfessionalWorkHours1738235100000 implements MigrationInterface {
  name = 'ProfessionalWorkHours1738235100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE babylone.professionals
      ADD COLUMN IF NOT EXISTS work_start_hour smallint NOT NULL DEFAULT 8,
      ADD COLUMN IF NOT EXISTS work_end_hour smallint NOT NULL DEFAULT 19;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE babylone.professionals
      DROP COLUMN IF EXISTS work_start_hour,
      DROP COLUMN IF EXISTS work_end_hour;
    `);
  }
}
