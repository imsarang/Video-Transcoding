import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";
import { ConvertController } from "./video-convert.controller";
import { ConvertService } from "./video-convert.service";
import { FfmpegConfig } from "src/config/ffmpeg.config";

@Module({
    imports: [LoggerModule],
    controllers: [ConvertController],
    providers: [ConvertService, FfmpegConfig],
})
export class ConvertModule { }