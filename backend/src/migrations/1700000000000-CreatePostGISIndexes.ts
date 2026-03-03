import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePostGISIndexes1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ne créer les index que si la table professionals existe (créée par synchronize ou migration initiale)
    const result = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'babylone' AND table_name = 'professionals') as exists`
    );
    const rows = Array.isArray(result) ? result : (result as { rows?: unknown[] })?.rows ?? [];
    const exists = rows[0] && (rows[0] as { exists?: boolean }).exists;
    if (!exists) {
      console.log('⏭️ Table babylone.professionals absente, index PostGIS ignorés (à recréer après 1er démarrage avec synchronize)');
      return;
    }

    // GIST sur position_gps uniquement si la colonne est de type geography (PostGIS)
    const colResult = await queryRunner.query(
      `SELECT data_type FROM information_schema.columns WHERE table_schema = 'babylone' AND table_name = 'professionals' AND column_name = 'position_gps'`
    );
    const colRows = Array.isArray(colResult) ? colResult : (colResult as { rows?: unknown[] })?.rows ?? [];
    const dataType = colRows[0] && (colRows[0] as { data_type?: string }).data_type;
    if (dataType === 'USER-DEFINED') {
      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_professionals_position_gps 
        ON babylone.professionals 
        USING GIST (position_gps);
      `);
    }

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_professionals_pays_code_position 
      ON babylone.professionals (pays_code) 
      WHERE position_gps IS NOT NULL;
    `);
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

