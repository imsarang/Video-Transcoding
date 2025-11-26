import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConvertController } from './modules/video-convert/video-convert.controller';
import { ConvertModule } from './modules/video-convert/video-convert.module';
import { LoggerModule } from 'nestjs-pino';
import { SqsConsumerService } from './modules/sqs/sqs_consumer.service';
import { SqsConsumerModule } from './modules/sqs/sqs_consumer.module';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './modules/redis/redis.module';

@Module({
  imports: [
    RedisModule,
    ConvertModule,
    // SqsConsumerModule,
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport: process.env.NODE_ENV !== 'production' ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname,req,res,responseTime',
          }
        } : undefined,
        autoLogging: false
      }
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [
    AppController,
    ConvertController,
  ],
  providers: [
    AppService,
    SqsConsumerService,
    ConfigService,
  ],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    console.log('AppModule initialized');
  }
}
