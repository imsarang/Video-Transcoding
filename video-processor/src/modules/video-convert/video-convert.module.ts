import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";
import { ConvertController } from "./video-convert.controller";
import { ConvertService } from "./video-convert.service";
import { FfmpegConfig } from "src/config/ffmpeg.config";
import { ConfigService } from "@nestjs/config";
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [LoggerModule, RedisModule],
    controllers: [ConvertController],
    providers: [ConvertService, FfmpegConfig, ConfigService],
    exports: [ConvertService],
})
export class ConvertModule { }