import { HttpModule } from '@nestjs/axios';
import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { VideoController } from 'src/modules/video/video.controller';
import { RedisModule } from '../redis/redis.module';
import { VideoService } from './video.service';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [HttpModule, RedisModule, WebSocketModule],
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly logger: Logger) {}

  onModuleInit() {
    this.logger.log('VideoModule initialized');
  }

  onModuleDestroy() {
    this.logger.log('VideoModule destroyed');
  }
}
