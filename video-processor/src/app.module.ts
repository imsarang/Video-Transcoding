import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConvertController } from './modules/video-convert/video-convert.controller';
import { ConvertModule } from './modules/video-convert/video-convert.module';
import { LoggerModule } from 'nestjs-pino';
import { ConvertService } from './modules/video-convert/video-convert.service';
import { SqsConsumerService } from './modules/sqs/sqs_consumer.service';
import { SqsConsumerModule } from './modules/sqs/sqs_consumer.module';
import { FfmpegConfig } from './config/ffmpeg.config';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConvertModule,
    SqsConsumerModule,
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
        autoLogging: false // optionally disable auto http logs
      }
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [
    AppController,
    ConvertController
  ],
  providers: [AppService, ConvertService, SqsConsumerService, FfmpegConfig, ConfigService],
})
export class AppModule {}
