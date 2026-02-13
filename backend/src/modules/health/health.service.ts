import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private redisClient: ReturnType<typeof createClient>;

  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private configService: ConfigService,
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
        minio: await this.checkMinIO(),
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

  private async checkMinIO(): Promise<{ status: string; latency?: number }> {
    try {
      const minioEndpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
      const minioPort = this.configService.get<number>('MINIO_PORT', 9000);
      const url = `http://${minioEndpoint}:${minioPort}/minio/health/live`;

      const start = Date.now();
      // Utiliser http ou https selon la disponibilité
      const http = await import('http');
      const https = await import('https');
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;

      await new Promise<void>((resolve, reject) => {
        const req = client.get(url, { timeout: 5000 }, (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            reject(new Error(`Status: ${res.statusCode}`));
          }
        });
        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });

      const latency = Date.now() - start;

      return {
        status: 'ok',
        latency,
      };
    } catch (error) {
      this.logger.error('MinIO health check failed', error);
      return {
        status: 'error',
      };
    }
  }
}
