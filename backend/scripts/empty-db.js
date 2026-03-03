/**
 * Vide toutes les tables du schéma babylone.
 * Usage: node scripts/empty-db.js   (depuis le dossier backend, avec .env configuré)
 *    ou: npm run db:empty
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.warn('.env non trouvé, utilisation des variables d\'environnement du système.');
    return;
  }
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) {
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1);
      process.env[m[1]] = val;
    }
  });
}

async function main() {
  loadEnv();
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '5432', 10);
  const user = process.env.DB_USERNAME || 'babylone_user';
  const password = process.env.DB_PASSWORD || 'babylone_secure_pass_2024';
  const database = process.env.DB_DATABASE || 'babylone_prod';

  const sqlPath = path.join(__dirname, 'empty-db.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = new Client({ host, port, user, password, database });
  try {
    await client.connect();
    await client.query(sql);
    console.log('Base de données vidée (schéma babylone).');
  } catch (err) {
    console.error('Erreur:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
