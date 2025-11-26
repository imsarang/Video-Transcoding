import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RedisConfig } from '../../config/redis.config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy, OnModuleInit {
  private redisClient: Redis;

  constructor(private readonly redisConfig: RedisConfig) {}

  onModuleInit() {
    // Force RedisConfig construction and client/log creation at application boot
    this.redisClient = this.redisConfig.getClient();
    console.log(this.redisClient.options.host);
    console.log(this.redisClient.options.port);
    
    console.log('RedisService initialized (onModuleInit)');
  }

  async set(key: string, value: string): Promise<'OK'> {
    return this.redisClient.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async publish(channel: string, message: string): Promise<number> {
    return this.redisClient.publish(channel, message);
  }

  async subscribe(channel: string, handler: (message: string) => void): Promise<void> {
    await this.redisClient.subscribe(channel);
    this.redisClient.on('message', (chan, message) => {
      if (chan === channel) {
        handler(message);
      }
    });
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }
}