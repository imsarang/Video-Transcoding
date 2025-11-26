import { Module, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisConfig } from '../../config/redis.config';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [RedisService, RedisConfig, ConfigService],
  exports: [RedisService],
})
export class RedisModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly redisConfig: RedisConfig) { }
  onModuleInit() {
    console.log('[RedisModule] Initializing Redis module');
    this.redisConfig.getClient();
  }
  onModuleDestroy() {
    console.log('[RedisModule] Destroying Redis module');
    this.redisConfig.getClient().quit();
  }
}