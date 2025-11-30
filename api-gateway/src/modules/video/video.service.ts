import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { Logger } from 'nestjs-pino';
import { WebSocketServerGateway } from 'src/modules/websocket/websocket.gateway';

@Injectable()
export class VideoService {
  constructor(
    private readonly redisService: RedisService,
    private readonly logger: Logger,
    private readonly websocketService: WebSocketServerGateway,
  ) {}

  async acceptSnsSubscriptionConfirmation(subscribeUrl: string) {
    try {
        this.logger.log({
            msg: 'Accepting SNS subscription confirmation',
            subscribeUrl: subscribeUrl
        });
      const response = await fetch(subscribeUrl);
      this.logger.log(response);

      return response.text();
    } catch (err) {
        this.logger.error({
            msg: 'Error accepting SNS subscription confirmation',
            error: err
        });
      throw new Error(err);
    }
  }

  async recieveProgressUpdate(
    snsMessage: any,
  ): Promise<{ inputKey: string; channel: string; socketRoom: string }> {
    let inputKey: string | null = null;
    try {
      if (
        snsMessage.Records &&
        Array.isArray(snsMessage.Records) &&
        snsMessage.Records.length > 0
      ) {
        inputKey = snsMessage.Records[0].s3.object.key;
      } else if (snsMessage.key) {
        inputKey = snsMessage.key;
      } else if (snsMessage.inputKey) {
        inputKey = snsMessage.inputKey;
      }

      if (!inputKey) {
        throw new Error('Input key not found in SNS message');
      }

      // Redis channel name (what video-service publishes to)
      const redisChannel = `video-progress:${inputKey}`;
      
      // WebSocket room name (same format - clients subscribe to this)
      const socketRoom = `video-progress:${inputKey}`;

      this.logger.log({
        msg: 'Subscribing to Redis channel for progress updates',
        inputKey,
        redisChannel,
        socketRoom,
      });

      // Subscribe to Redis channel to receive progress reports from video-processing service
      await this.redisService.subscribe(redisChannel, async (message: string) => {
        try {
          const progressData = JSON.parse(message);

          // Send progress to all WebSocket clients in the room
          this.websocketService.emitToRoom(socketRoom, 'progress', {
            inputKey,
            progress: progressData,
            timestamp: new Date().toISOString(),
          });

          // If progress indicates completion, cleanup Redis subscription
          if (progressData.status === 'completed' || progressData.complete) {
            this.logger.log({
              msg: 'Video conversion completed',
              inputKey,
              progress: progressData,
            });

            // Unsubscribe from Redis channel to cleanup resources
            await this.redisService.unsubscribe(redisChannel);
            this.logger.log({
              msg: 'Cleaned up Redis subscription after completion',
              inputKey,
              redisChannel,
            });
          }
        } catch (e) {
          // If message is not JSON, log as raw and send as-is
          this.logger.log({
            msg: '📊 Progress update received from video-processing (raw)',
            redisChannel,
            inputKey,
            message,
          });

          // Send raw message to clients
          this.websocketService.emitToRoom(socketRoom, 'progress', {
            inputKey,
            progress: message,
            timestamp: new Date().toISOString(),
          });

          // Check if raw message indicates completion
          if (
            typeof message === 'string' &&
            (message.includes('completed') || message.includes('complete'))
          ) {
            await this.redisService.unsubscribe(redisChannel);
            this.logger.log({
              msg: 'Cleaned up Redis subscription after completion (raw message)',
              inputKey,
              redisChannel,
            });
          }
        }
      });

      return {
        inputKey: inputKey,
        channel: redisChannel,
        socketRoom: socketRoom,
      };
    } catch (err) {
      this.logger.error({
        msg: 'Error receiving progress update',
        error: err instanceof Error ? err.message : String(err),
      });
      throw err instanceof Error ? err : new Error(String(err));
    }
  }

  async mapInputKeyToOutputKey(
    inputKey: string,
    outputKey: string,
    outputKeyMap: Map<string, string>,
  ): Promise<void> {
    try {
      outputKeyMap.set(inputKey, outputKey);
    } catch (err) {
      throw new Error(err);
    }
  }
}
