import { Module, OnModuleInit } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { WebSocketServerGateway } from './websocket.gateway';
import { WebSocketConfig } from 'src/config/websocket.config';

@Module({
  providers: [WebSocketServerGateway, WebSocketConfig],
  exports: [WebSocketServerGateway],
})
export class WebSocketModule implements OnModuleInit {
  constructor(private readonly logger: Logger) {}

  onModuleInit() {
    this.logger.log({
      msg: 'WebSocketModule initialized',
      note: 'WebSocket gateway is ready to accept connections',
    });
  }
}
