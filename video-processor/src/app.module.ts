import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConvertController } from './modules/video-convert/video-convert.controller';
import { ConvertModule } from './modules/video-convert/video-convert.module';
import { LoggerModule } from 'nestjs-pino';
import { ConvertService } from './modules/video-convert/video-convert.service';
import { SqsConsumerService } from './modules/sqs/sqs_consumer.service';
import { SqsConsumerModule } from './modules/sqs/sqs_consumer.module';
import { ConfigModule } from '@nestjs/config';
import { FfmpegConfig } from './config/ffmpeg.config';

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
            ignore: 'pid,hostname',
          },
        } : undefined,
      }
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    })
  ],
  controllers: [
    AppController,
    ConvertController
  ],
  providers: [AppService, ConvertService, SqsConsumerService, FfmpegConfig],
})
export class AppModule {}
