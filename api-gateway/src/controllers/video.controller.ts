import { HttpService } from "@nestjs/axios";
import { Body, Controller, Get, Headers, Post, Query } from "@nestjs/common";
import { randomUUID } from "crypto";
import { Logger } from "nestjs-pino";
import { firstValueFrom } from "rxjs";
import { RedisService } from "src/modules/redis/redis.service";

const outputKeyMap: Map<string, string> = new Map();

@Controller('/video')
export class VideoController {

    private url= process.env.VIDEO_TOOLS_BFF ?? 'http://localhost:3004'

    constructor(
        private readonly logger: Logger,
        private readonly httpService: HttpService,
        private readonly redisService: RedisService
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
                result: result.data
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
        
        // Option 2: Generate unique session-based identifier
        
        // Option 3: Use timestamp + random UUID as fallback
        const uniqueId =`${Date.now()}-${randomUUID()}`;
        
        // Create unique S3 key: {userId|sessionId}/{timestamp}-{originalFilename}
        const sanitizedUserId = String(uniqueId).replace(/[^a-zA-Z0-9_-]/g, '_');
        const timestamp = Date.now();
        const sanitizedFilename =body.originalKey?.replace(/[^a-zA-Z0-9._-]/g, '_') || 'file';
        const uniqueKey = `${sanitizedUserId}/${timestamp}-${sanitizedFilename}`;
        body = {...body, uniqueKey: uniqueKey}
        const response = await this.proxyRequest('post', `/video/upload/pre-signed-s3-url`, body,{})
        console.log(response);
        
        return response
    }

    @Get('/download/pre-signed-s3-url')
    async getDownloadPreSignedUrl(@Query('key') key: string){
        return await this.proxyRequest('get', `/video/download/pre-signed-s3-url?key=${key}`, undefined, { key: outputKeyMap[key] })
    }
    @Post('/convert/extension')
    async convertVideo(
        @Body() body: any,
    ){
        return await this.proxyRequest('post', '/video/convert/extension', body)
    }

    @Post('/webhook')
    async webhook(
        @Body() body: any,
        @Headers() headers: any
    ) {
        
        if(typeof body === 'string') {
          try{
            body = JSON.parse(body);
            this.logger.log('Parsed SNS body:', body);
            
          } catch (e) {
            this.logger.error({
              msg: 'Error parsing JSON',
              error: e.message
            });
            return { status: 'Invalid JSON', error: e };
          }
        }

        if(headers['x-amz-sns-message-type'] === 'SubscriptionConfirmation') {
          this.logger.log('SNS subscription confirmed');
          await fetch(body.SubscribeURL)
            .then(response => response.text())
            .then(data => {
              this.logger.log('SNS subscription confirmed', data);
              return { status: 'Subscription confirmed' };
            })
            .catch(error => {
              this.logger.error('Error confirming SNS subscription', error);
              return { status: 'Error confirming SNS subscription', error: error.message };
            });
        }

        if(body.Type === 'Notification') {
          let message;
          try {
            message = typeof body.Message === 'string' ? JSON.parse(body.Message) : body.Message;
          } catch (e) {
            this.logger.error({
              msg: 'Error parsing SNS message',
              error: e.message
            });
            return { status: 'Invalid message format', error: e };
          }

          // Extract input S3 key from SNS message
          // S3 event notifications typically have: Records[0].s3.object.key
          let inputKey: string | null = null;
          
          if (message.Records && Array.isArray(message.Records) && message.Records.length > 0) {
            // S3 event notification structure
            const s3Record = message.Records[0];
            inputKey = s3Record.s3?.object?.key || s3Record.s3Object?.key;
          } else if (message.key) {
            // Direct key in message
            inputKey = message.key;
          } else if (message.inputKey) {
            // Alternative key field
            inputKey = message.inputKey;
          }

          if (!inputKey) {
            this.logger.error({
              msg: 'Could not extract input key from SNS message',
              message: message
            });
            return { status: 'error', message: 'Input key not found in notification' };
          }

          this.logger.log({
            msg: 'Processing SNS notification',
            inputKey,
            messageType: message.Records?.[0]?.eventName || 'unknown'
          });
          
          try {
            // Subscribe to the progress channel BEFORE starting conversion
            // Use the inputKey extracted from SNS message to construct channel name
            // This ensures it matches what video-service publishes to
            const channel = `video-progress:${inputKey}`;
            
            this.logger.log({
              msg: 'Subscribing to Redis progress channel before conversion',
              channel,
              inputKey
            });

            // Subscribe with handler that logs all progress messages
            await this.redisService.subscribe(channel, (message: string) => {
              try {
                const progressData = JSON.parse(message);
                this.logger.log({
                  msg: '📊 Progress update received from video-processing',
                  channel,
                  inputKey,
                  progress: progressData,
                  timestamp: new Date().toISOString()
                });
              } catch (e) {
                // If message is not JSON, log as raw string
                this.logger.log({
                  msg: '📊 Progress update received from video-processing (raw)',
                  channel,
                  inputKey,
                  message,
                  timestamp: new Date().toISOString()
                });
              }
            });
            
            // Now start the conversion - progress messages will be logged as they arrive
            const result = await this.proxyRequest('post', `/video/convert`, message);
        
            // Map input key to output key (supports multiple concurrent users/devices)
            if (result?.outputKey) {
              outputKeyMap.set(inputKey, result.outputKey);
              this.logger.log({
                msg: 'Video conversion request completed',
                inputKey,
                outputKey: result.outputKey,
                note: 'Progress messages continue to arrive via Redis subscription'
              });
            } else {
              this.logger.warn({
                msg: 'Conversion result missing outputKey',
                inputKey,
                result
              });
            }
            
            return { 
              status: 'success', 
              inputKey, 
              outputKey: result?.outputKey,
              channel,
              note: 'Listening for progress updates on Redis channel: ' + channel
            };
          } catch(e) {
            this.logger.error({
              msg: 'Error converting video',
              error: e.message,
              inputKey,
              stack: e.stack
            });
            return { 
              status: 'error', 
              error: e.message, 
              inputKey 
            };
          }
        }

        return { status: 'unknown message type' };
    }
}