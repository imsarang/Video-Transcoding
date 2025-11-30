import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { RedisConfig } from '../../config/redis.config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy, OnModuleInit {
  private redisClient: Redis;
  private subscriber: Redis;
  private readonly channelHandlers: Map<string, (message: string) => void> =
    new Map();

  constructor(
    private readonly redisConfig: RedisConfig,
    private readonly logger: Logger,
  ) {}

  onModuleInit() {
    // Regular Redis client singleton for commands (get, set, publish)
    this.redisClient = this.redisConfig.getClient();

    // Subscriber client singleton for pub/sub operations
    // Redis protocol requires separate client instances:
    // - Regular client: can execute commands but cannot subscribe
    // - Subscriber client: can subscribe but cannot execute regular commands
    // Both are singletons managed by RedisConfig
    this.subscriber = this.redisConfig.getSubscriberClient();

    // Set up message handler for all subscribed channels
    this.subscriber.on('message', (channel: string, message: string) => {
      const handler = this.channelHandlers.get(channel);
      if (handler) {
        handler(message);
      }
    });

    // Log subscription events
    this.subscriber.on('subscribe', (channel: string) => {
      this.logger.log({
        msg: 'Subscribed to Redis channel',
        channel,
      });
    });

    this.subscriber.on('error', (error: Error) => {
      this.logger.error({
        msg: 'Redis subscriber error',
        error: error.message,
        stack: error.stack,
      });
    });

    this.logger.log({
      msg: 'RedisService initialized',
      host: this.redisClient.options.host,
      port: this.redisClient.options.port,
    });
  }

  async set(key: string, value: string): Promise<'OK'> {
    return this.redisClient.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async publish(channel: string, message: string): Promise<number> {
    return this.redisClient.publish(channel, message);
  }

  async subscribe(
    channel: string,
    handler: (message: string) => void,
  ): Promise<void> {
    try {
      // Store handler for this channel
      this.channelHandlers.set(channel, handler);

      // Subscribe to channel (channels are unique per conversion)
      await this.subscriber.subscribe(channel);

      this.logger.log({
        msg: 'Successfully subscribed to channel',
        channel,
      });
    } catch (error) {
      this.logger.error({
        msg: 'Failed to subscribe to channel',
        channel,
        error: error.message,
      });
      throw error;
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    try {
      await this.subscriber.unsubscribe(channel);
      this.channelHandlers.delete(channel);

      this.logger.log({
        msg: 'Unsubscribed from channel',
        channel,
      });
    } catch (error) {
      this.logger.error({
        msg: 'Failed to unsubscribe from channel',
        channel,
        error: error.message,
      });
    }
  }

  async onModuleDestroy() {
    if (this.subscriber) {
      await this.subscriber.quit();
    }
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }
}
