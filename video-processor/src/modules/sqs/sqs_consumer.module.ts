import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";
import { SqsConsumerService } from "./sqs_consumer.service";
import { ConvertService } from "../video-convert/video-convert.service";
import { FfmpegConfig } from "src/config/ffmpeg.config";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [
        LoggerModule,
        ConfigModule
    ],
    providers: [
        SqsConsumerService,
        ConvertService,
        FfmpegConfig
    ]
})
export class SqsConsumerModule {}