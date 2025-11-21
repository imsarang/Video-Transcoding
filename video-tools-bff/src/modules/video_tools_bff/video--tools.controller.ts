import { BadRequestException, Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { VideoToolsBffService } from "./video-tools.service";
import { HttpService } from "@nestjs/axios";
import { Logger } from "nestjs-pino";
import { firstValueFrom } from "rxjs";

@Controller('video')
export class VideoToolsBffController {
    constructor(
        private readonly videoToolsService: VideoToolsBffService,
        private readonly logger: Logger,
        private readonly httpService: HttpService
    ) {}

    private processingUrl: string = `${process.env.VIDEO_PROCESSING_URL}/processing` || 'http://localhost:3005/processing';

    private async proxyRequest(
        method: 'get' | 'post' | 'put'| 'delete',
        path: string,
        data?: any,
        params?: any
    ){
        this.logger.log(`Forwarding ${method.toUpperCase()} request to ${this.processingUrl}`);
        const url = `${this.processingUrl}${path}`;
        try {
            const response = this.httpService.request({
                method,
                url,
                data,
                params,
                validateStatus: status => true, // Don't throw on any status
            });

            const result = await firstValueFrom(response);
            this.logger.log({
                msg: `Proxy response received`,
                status: result.status,
                statusText: result.statusText,
                url: url
            });
            return result.data;
        } catch (error) {
            this.logger.error({
                msg: 'Proxy request failed',
                error: error.message,
                url,
                method,
                data
            });
            throw error;
        }
    }

    // construct an upload pre-signed s3 url
    @Post('/upload/pre-signed-s3-url')
    async getUploadPreSignedS3Url(
        @Body() body
    ): Promise<string> {
        const {key, contentType, metadata} = body
        console.log(key, contentType, metadata);
        console.log("BODY RECEIVED:", body);
        console.log("TYPE OF METADATA:", typeof metadata);
        return await this.videoToolsService.createUploadPreSignedUrl(key, contentType, metadata);
    }

    // construct a download pre-signed s3 url
    @Get('/download/pre-signed-s3-url')
    async getDownloadPreSignedS3Url(
        @Query('key') key: string
    ): Promise<string> {
        if (!key || key.trim() === '') {
            throw new BadRequestException('Query parameter "key" is required');
        }

        return await this.videoToolsService.createDownloadPreSignedUrl(key);
    }

    // api to convert video extension
    @Post('/convert/extension')
    async convertVideo(
        @Body() body: any
    ): Promise<any> {
        // return await this.proxyRequest('post', '/convert/extension', body)
        // upload the image to the pre-signed url

        // future: will push it to bull queue and will be uploading it form there
    }

    // api to convert video quality/ resolution
    @Post('/convert/transoder')
    async convertVideoQuality(
        @Body() body: any
    ): Promise<any> {
        return await this.proxyRequest('post', '/convert/transcoder', body)
    }

    // download video
    @Get('/download/:id')
    async downloadVideo(
        @Param('id') id: string
    ): Promise<any> {
        return this.videoToolsService.downloadVideo(id);
    }

}