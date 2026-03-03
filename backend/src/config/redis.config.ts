import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisConfig {
  constructor(private configService: ConfigService) {}

  createRedisClient(): Redis {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (redisUrl) {
      return new Redis(redisUrl, {
        retryStrategy: (times) => Math.min(times * 50, 2000),
      });
    }
    return new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
  }
}
