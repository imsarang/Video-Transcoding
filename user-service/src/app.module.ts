import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database.module';
import { DataDogLogger } from './modules/logger.module';
import { LoggerModule } from 'nestjs-pino';
import { UserModule } from './modules/user.module';

@Module({
  imports: [
    DatabaseModule, //Database module imported here
    // DataDogLogger, // Datadog logs when deployed
    // Provide nestjs-pino Logger so the global interceptor can retrieve it
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info'
      }
    }),
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
