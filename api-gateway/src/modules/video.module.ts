import { HttpModule } from "@nestjs/axios";
import { Module, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Logger } from "nestjs-pino";
import { VideoController } from "src/controllers/video.controller";
import { RedisModule } from "./redis/redis.module";

@Module({
    imports: [HttpModule, RedisModule],
    controllers: [VideoController]
})
export class VideoModule implements OnModuleInit, OnModuleDestroy{
    constructor(
        private readonly logger: Logger
    ){}

    onModuleInit() {
        this.logger.log('VideoModule initialized')
    }

    onModuleDestroy() {
        this.logger.log('VideoModule destroyed')
    }
}