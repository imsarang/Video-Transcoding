import { BadRequestException, Body, Controller, Get, Headers, Param, Post, Query, Req } from "@nestjs/common";
import { VideoToolsBffService } from "./video-tools.service";
import { HttpService } from "@nestjs/axios";
import { Logger } from "nestjs-pino";
import { firstValueFrom } from "rxjs";
import { randomUUID } from "crypto";

// Global map to store input key -> output key mappings (thread-safe for concurrent requests)
// Key: input S3 key (e.g., "user123/1234567890-video.mp4")
// Value: output S3 key after processing

@Controller('video')
export class VideoToolsBffController {
    constructor(
        private readonly videoToolsService: VideoToolsBffService,
        private readonly logger: Logger,
        private readonly httpService: HttpService
    ) {}

    private processingUrl: string = process.env.VIDEO_PROCESSING_URL ? `${process.env.VIDEO_PROCESSING_URL}/processing` : 'http://localhost:3005/processing';

    private async proxyRequest(
        method: 'get' | 'post' | 'put'| 'delete',
        path: string,
        data?: any,
        params?: any
    ){
        const url = `${this.processingUrl}${path}`;
        this.logger.log(`Forwarding ${method.toUpperCase()} request to ${url}`);
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
        @Body() body,
        @Req() req: any
    ): Promise<{ url: string; key: string }> {
        const { key: originalKey, contentType, metadata, uniqueKey } = body;
        
        
        this.logger.log({
            msg: 'Generating pre-signed URL',
            originalKey,
            uniqueKey,
            hasAuth: !!req.user,
            remoteAddress: req.socket?.remoteAddress || req.ip
        });
        
        const url = await this.videoToolsService.createUploadPreSignedUrl(uniqueKey, contentType, metadata);
        
        // Return both URL and key so frontend can track it
        return {
            url,
            key: uniqueKey
        };
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
        return await this.proxyRequest('post', '/transcoder', body)
    }

    @Post('/convert')
    async convertVideoFormat(
        @Body() body: any
    ): Promise<any> {
        return await this.proxyRequest('post', '/convert', body)
    }
}