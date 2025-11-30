import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisConfig {
  // Singleton for regular Redis operations (get, set, publish)
  private static redisClient: Redis;
  // Singleton for pub/sub operations (subscribe)
  // Note: Redis requires separate client instances for pub/sub vs regular commands
  private static subscriberClient: Redis;

  constructor(private readonly configService: ConfigService) {
    RedisConfig.redisClient = this.newClient();
    console.log(
      '[RedisConfig] Redis singleton client instance created eagerly at app startup',
    );
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
    console.log(
      `[RedisConfig] Creating Redis client at host: ${host}, port: ${port}`,
    );
    return new Redis({ host, port });
  }

  /**
   * Get singleton Redis client for regular operations (get, set, publish)
   * This client cannot be used for subscriptions
   */
  getClient(): Redis {
    return RedisConfig.redisClient;
  }

  /**
   * Get singleton Redis subscriber client for pub/sub operations
   * This is a separate singleton instance required by Redis protocol
   * A subscribed client cannot execute regular Redis commands
   */
  getSubscriberClient(): Redis {
    if (!RedisConfig.subscriberClient) {
      const host = this.getHost();
      const port = this.getPort();
      console.log(
        `[RedisConfig] Creating Redis subscriber singleton client at host: ${host}, port: ${port}`,
      );
      RedisConfig.subscriberClient = new Redis({ host, port });
    }
    return RedisConfig.subscriberClient;
  }
}
