import { Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

function trimEnv(value: string | undefined): string | undefined {
  if (value == null) return value;
  return typeof value === 'string' ? value.trim().replace(/\r$/, '') : value;
}

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    // Trim pour éviter \r ou espaces (fichier .env sous Windows)
    const password = trimEnv(this.configService.get<string>('DB_PASSWORD')) || 'babylone_secure_pass_2024';
    return {
      type: 'postgres',
      host: trimEnv(this.configService.get<string>('DB_HOST')) || 'localhost',
      port: this.configService.get<number>('DB_PORT', 5432),
      username: trimEnv(this.configService.get<string>('DB_USERNAME')) || 'babylone_user',
      password,
      database: trimEnv(this.configService.get<string>('DB_DATABASE')) || 'babylone_prod',
      schema: 'babylone',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      synchronize: this.configService.get<boolean>('DB_SYNCHRONIZE', false),
      logging: this.configService.get<string>('NODE_ENV') === 'development',
      extra: {
        // Configuration PostGIS
        max: 20, // Maximum de connexions dans le pool
        connectionTimeoutMillis: 2000,
      },
    };
  }
}
