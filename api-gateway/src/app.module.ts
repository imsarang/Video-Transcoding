import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PinoLoggerModule } from './modules/logger.module';
import { CorsModule } from './modules/cors.module';
import { RateLimiterModule } from './modules/rate-limiter.module';
import { AuthModule } from './modules/auth.module';
import { UserModule } from './modules/user.module';

@Module({
  imports: [
    PinoLoggerModule,
    CorsModule,
    RateLimiterModule,
    AuthModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
