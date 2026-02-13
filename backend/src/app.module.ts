import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseConfig } from './config/database.config';

// Modules métier
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfessionalsModule } from './modules/professionals/professionals.module';
import { ServicesModule } from './modules/services/services.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { ChatModule } from './modules/chat/chat.module';
import { SocialModule } from './modules/social/social.module';
import { StorageModule } from './modules/storage/storage.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { WithdrawalsModule } from './modules/withdrawals/withdrawals.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { BackupModule } from './modules/backup/backup.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // Configuration globale
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate Limiting global
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          throttlers: [{
            ttl: configService.get<number>('THROTTLE_TTL', 60) * 1000, // en millisecondes
            limit: configService.get<number>('THROTTLE_LIMIT', 100),
          }],
        };
      },
    }),

    // Database PostgreSQL + PostGIS
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
    }),

    // Redis sera utilisé directement via ioredis dans les services

    // Modules métier
    AuthModule,
    UsersModule,
    WalletModule,
    ProfessionalsModule,
    ServicesModule,
    TransactionsModule,
    PaymentsModule,
    WithdrawalsModule,
    ChatModule,
    SocialModule,
    StorageModule,
    BookingsModule,
    BackupModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

