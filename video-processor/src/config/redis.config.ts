import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisConfig {
  private static redisClient: Redis;
  constructor(private readonly configService: ConfigService) {
    RedisConfig.redisClient = this.newClient();
    console.log('[RedisConfig] Redis singleton client instance created eagerly at app startup');
  }

  getHost(): string {
    return this.configService.get('REDIS_HOST') || 'localhost';
  }

  getPort(): number {
    return parseInt(this.configService.get('REDIS_PORT') || '6379');
  }

  private newClient(): Redis {
    const host = this.getHost();
    const port = this.getPort();
    console.log(`[RedisConfig] Creating Redis client at host: ${host}, port: ${port}`);
    return new Redis({ host, port });
  }

  getClient(): Redis {
    return RedisConfig.redisClient;
  }
}