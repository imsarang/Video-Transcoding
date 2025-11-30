import { HttpService } from '@nestjs/axios';
import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Logger } from 'nestjs-pino';
import { firstValueFrom } from 'rxjs';
import { RedisService } from 'src/modules/redis/redis.service';
import { VideoService } from './video.service';

const outputKeyMap: Map<string, string> = new Map();

@Controller('/video')
export class VideoController {
  private url = process.env.VIDEO_TOOLS_BFF ?? 'http://localhost:3004';

  constructor(
    private readonly logger: Logger,
    private readonly httpService: HttpService,
    private readonly redisService: RedisService,
    private readonly videoService: VideoService,
  ) {}
  private async proxyRequest(
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    data?: any,
    params?: any,
  ) {
    this.logger.log(
      `Forwarding ${method.toUpperCase()} request to ${this.url}`,
    );
    const url = `${this.url}${path}`;
    this.logger.log('body', data);
    try {
      const response = this.httpService.request({
        method,
        url,
        data,
        params,
        validateStatus: (status) => true, // Don't throw on any status
      });

      const result = await firstValueFrom(response);

      this.logger.log({
        result: result.data,
      });
      return result.data;
    } catch (error) {
      this.logger.error({
        msg: 'Proxy request failed',
        error: error.message,
        url,
        method,
        data,
      });
      throw error;
    }
  }

  @Post('/upload/pre-signed-s3-url')
  async getUploadPreSignedUrl(@Body() body: any) {
    // Option 2: Generate unique session-based identifier

    // Option 3: Use timestamp + random UUID as fallback
    const uniqueId = `${Date.now()}-${randomUUID()}`;

    // Create unique S3 key: {userId|sessionId}/{timestamp}-{originalFilename}
    const sanitizedUserId = String(uniqueId).replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = Date.now();
    const sanitizedFilename =
      body.originalKey?.replace(/[^a-zA-Z0-9._-]/g, '_') || 'file';
    const uniqueKey = `${sanitizedUserId}/${timestamp}-${sanitizedFilename}`;
    body = { ...body, uniqueKey: uniqueKey };
    const response = await this.proxyRequest(
      'post',
      `/video/upload/pre-signed-s3-url`,
      body,
      {},
    );
    console.log(response);

    return response;
  }

  @Get('/download/pre-signed-s3-url')
  async getDownloadPreSignedUrl(@Query('key') key: string) {
    return await this.proxyRequest(
      'get',
      `/video/download/pre-signed-s3-url?key=${key}`,
      undefined,
      { key: outputKeyMap[key] },
    );
  }
  @Post('/convert/extension')
  async convertVideo(@Body() body: any) {
    return await this.proxyRequest('post', '/video/convert/extension', body);
  }

  @Post('/webhook')
  async webhook(@Body() body: any, @Headers() headers: any) {
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
        this.logger.log('Parsed SNS body:', body);
      } catch (e) {
        this.logger.error({
          msg: 'Error parsing JSON',
          error: e.message,
        });
        return { status: 'Invalid JSON', error: e };
      }
    }
    
    if (headers['x-amz-sns-message-type'] === 'SubscriptionConfirmation') {
      this.logger.log('SNS subscription confirmed');
      return await this.videoService.acceptSnsSubscriptionConfirmation(
        body.SubscribeURL,
      );
    }

    if (body.Type === 'Notification') {
      let message;
      try {
        message =
          typeof body.Message === 'string'
            ? JSON.parse(body.Message)
            : body.Message;
      } catch (e) {
        this.logger.error({
          msg: 'Error parsing SNS message',
          error: e.message,
        });
        return { status: 'Invalid message format', error: e };
      }

      try {
        const { inputKey, channel } =
          await this.videoService.recieveProgressUpdate(message);
        // Now start the conversion - progress messages will be logged as they arrive
        const result = await this.proxyRequest(
          'post',
          `/video/convert`,
          message,
        );

        await this.videoService.mapInputKeyToOutputKey(
          inputKey,
          result.outputKey,
          outputKeyMap,
        );

        return {
          status: 'success',
          outputKey: result?.outputKey,
          channel,
          note: 'Listening for progress updates on Redis channel: ' + channel,
        };
      } catch (e) {
        this.logger.error({
          msg: 'Error converting video',
          error: e.message,
          stack: e.stack,
        });
        return {
          status: 'error',
          error: e.message,
        };
      }
    }

    return { status: 'unknown message type' };
  }
}
