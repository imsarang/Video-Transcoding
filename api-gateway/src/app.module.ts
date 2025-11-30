import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PinoLoggerModule } from './modules/logger/logger.module';
import { CorsModule } from './modules/cors/cors.module';
import { RateLimiterModule } from './modules/rate-limiter/rate-limiter.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { VideoModule } from './modules/video/video.module';
import { WebSocketModule } from './modules/websocket/websocket.module';

@Module({
  imports: [
    PinoLoggerModule,
    CorsModule,
    RateLimiterModule,
    AuthModule,
    UserModule,
    VideoModule,
    WebSocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
