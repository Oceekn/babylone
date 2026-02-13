import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePostGISIndexes1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Créer l'index spatial GIST sur position_gps pour la recherche rapide
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_professionals_position_gps 
      ON babylone.professionals 
      USING GIST (position_gps);
    `);

    // Index composite pour optimiser les recherches par pays + position
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_professionals_pays_code_position 
      ON babylone.professionals (pays_code) 
      WHERE position_gps IS NOT NULL;
    `);

    // Index pour les recherches actives
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_professionals_is_active_position 
      ON babylone.professionals (is_active) 
      WHERE is_active = true AND position_gps IS NOT NULL;
    `);

    console.log('✅ PostGIS indexes created successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS babylone.idx_professionals_position_gps;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS babylone.idx_professionals_pays_code_position;
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS babylone.idx_professionals_is_active_position;
    `);
  }
}

