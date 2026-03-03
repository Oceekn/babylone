import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private redisClient: ReturnType<typeof createClient>;

  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private configService: ConfigService,
    private storageService: StorageService,
  ) {
    // Initialiser le client Redis pour les health checks
    this.redisClient = createClient({
      socket: {
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
      },
      password: this.configService.get<string>('REDIS_PASSWORD'),
    });

    this.redisClient.on('error', (err) => {
      this.logger.error('Redis Client Error', err);
    });
  }

  async checkHealth() {
    const checks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      version: '1.0.0',
    };

    return checks;
  }

  async getDetailedHealth() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      version: '1.0.0',
      services: {
        database: await this.checkDatabase(),
        redis: await this.checkRedis(),
        storage: this.checkStorage(),
      },
      system: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        node_version: process.version,
      },
    };

    // Déterminer le statut global
    const allServicesOk = Object.values(health.services).every(
      (service: any) => service.status === 'ok',
    );
    health.status = allServicesOk ? 'ok' : 'degraded';

    return health;
  }

  private async checkDatabase(): Promise<{ status: string; latency?: number }> {
    try {
      const start = Date.now();
      await this.dataSource.query('SELECT 1');
      const latency = Date.now() - start;

      return {
        status: 'ok',
        latency,
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        status: 'error',
      };
    }
  }

  private async checkRedis(): Promise<{ status: string; latency?: number }> {
    try {
      if (!this.redisClient.isOpen) {
        await this.redisClient.connect();
      }

      const start = Date.now();
      await this.redisClient.ping();
      const latency = Date.now() - start;

      return {
        status: 'ok',
        latency,
      };
    } catch (error) {
      this.logger.error('Redis health check failed', error);
      return {
        status: 'error',
      };
    }
  }

  private checkStorage(): { status: string } {
    return {
      status: this.storageService.isAvailable() ? 'ok' : 'error',
    };
  }
}
