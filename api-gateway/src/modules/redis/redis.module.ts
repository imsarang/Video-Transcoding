import { Module, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis.service';
import { RedisConfig } from '../../config/redis.config';

@Module({
  imports: [ConfigModule],
  providers: [RedisService, RedisConfig],
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