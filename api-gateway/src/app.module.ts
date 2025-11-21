import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PinoLoggerModule } from './modules/logger.module';
import { CorsModule } from './modules/cors.module';
import { RateLimiterModule } from './modules/rate-limiter.module';
import { AuthModule } from './modules/auth.module';
import { UserModule } from './modules/user.module';
import { VideoModule } from './modules/video.module';

@Module({
  imports: [
    PinoLoggerModule,
    CorsModule,
    RateLimiterModule,
    AuthModule,
    UserModule,
    VideoModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
