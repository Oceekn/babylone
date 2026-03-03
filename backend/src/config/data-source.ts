import { DataSource } from 'typeorm';

function trimEnv(value: string | undefined): string | undefined {
  if (value == null) return value;
  return typeof value === 'string' ? value.trim().replace(/\r$/, '') : value;
}

const databaseUrl = trimEnv(process.env.DATABASE_URL);

const dataSource = new DataSource({
  type: 'postgres',
  ...(databaseUrl
    ? { url: databaseUrl }
    : {
        host: trimEnv(process.env.DB_HOST) || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: trimEnv(process.env.DB_USERNAME) || 'babylone_user',
        password: trimEnv(process.env.DB_PASSWORD) || 'babylone_secure_pass_2024',
        database: trimEnv(process.env.DB_DATABASE) || 'babylone_prod',
      }),
  schema: 'babylone',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  logging: process.env.NODE_ENV === 'development',
});

export default dataSource;
