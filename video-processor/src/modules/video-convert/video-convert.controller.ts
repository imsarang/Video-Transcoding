import { Body, Controller, Post } from "@nestjs/common";
import { Logger } from "nestjs-pino";
import { ConvertService } from "./video-convert.service";

@Controller('/processing/convert')
export class ConvertController {
    constructor(
        private readonly logger: Logger,
        private readonly convertService: ConvertService
    ){}

    @Post('/extension')
    async convertVideo(
        @Body() body: any
    ){
        return this.convertService.convertVideoFormat(body)
    }
}