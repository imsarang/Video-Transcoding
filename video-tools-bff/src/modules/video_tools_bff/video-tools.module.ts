import { Module } from "@nestjs/common";
import { VideoToolsBffController } from "./video--tools.controller";
import { VideoToolsBffService } from "./video-tools.service";
import { AWSConfig } from "src/config/aws.config";
import { LoggerModule } from "nestjs-pino";
import { HttpModule, HttpService } from "@nestjs/axios";

@Module({
    imports: [
        LoggerModule,
        HttpModule
    ],
    controllers: [VideoToolsBffController],
    providers: [
        VideoToolsBffService,
        AWSConfig
    ],
})
export class VideoToolsBffModule{}