import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VideoToolsBffModule } from './modules/video_tools_bff/video-tools.module';
import { ConfigModule } from '@nestjs/config';
import { AWSConfig } from './config/aws.config';
import { LoggerModule } from 'nestjs-pino';
import { VideoToolsBffService } from './modules/video_tools_bff/video-tools.service';
import { VideoToolsBffController } from './modules/video_tools_bff/video--tools.controller';
import { HttpModule } from '@nestjs/axios';


@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    VideoToolsBffModule,
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
    })
  ],
  controllers: [AppController, VideoToolsBffController],
    providers: [AppService,
    AWSConfig,
    VideoToolsBffService
    ],
})
export class AppModule {}
