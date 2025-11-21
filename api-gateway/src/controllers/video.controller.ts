import { HttpService } from "@nestjs/axios";
import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { Logger } from "nestjs-pino";
import { firstValueFrom } from "rxjs";

@Controller('/video')
export class VideoController {

    private url= process.env.VIDEO_TOOLS_BFF ?? 'http://localhost:3004'

    constructor(
        private readonly logger: Logger,
        private readonly httpService: HttpService
    ){}
    private async proxyRequest(
        method: 'get' | 'post' | 'put'| 'delete',
        path: string,
        data?: any,
        params?: any
    ){
        this.logger.log(`Forwarding ${method.toUpperCase()} request to ${this.url}`);
        const url = `${this.url}${path}`;
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

    @Post('/upload/pre-signed-s3-url')
    async getUploadPreSignedUrl(
        @Body() body: any
    ){
        const response = await this.proxyRequest('post', `/video/upload/pre-signed-s3-url`, body,{})
        return response
    }

    @Get('/download/pre-signed-s3-url')
    async getDownloadPreSignedUrl(@Query('key') key: string){
        return await this.proxyRequest('get', `/video/download/pre-signed-s3-url`, undefined, { key })
    }
    @Post('/convert/extension')
    async convertVideo(
        @Body() body: any
    ){
        return await this.proxyRequest('post', '/video/convert/extension', body)
    }
}