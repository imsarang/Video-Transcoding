import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";
import { ConvertController } from "./video-convert.controller";
import { ConvertService } from "./video-convert.service";
import { FfmpegConfig } from "src/config/ffmpeg.config";
import { ConfigService } from "@nestjs/config";

@Module({
    imports: [LoggerModule],
    controllers: [ConvertController],
    providers: [ConvertService, FfmpegConfig, ConfigService],
})
export class ConvertModule { }