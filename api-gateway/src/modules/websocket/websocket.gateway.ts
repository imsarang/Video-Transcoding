import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebSocketConfig } from 'src/config/websocket.config';
import { Logger } from 'nestjs-pino';

@WebSocketGateway({
  namespace: '/',
  cors: {
    origin: process.env.WEBSOCKET_CORS_ORIGIN
      ? process.env.WEBSOCKET_CORS_ORIGIN.split(',')
      : ['http://localhost:3000'],
    credentials: true,
  },
})
export class WebSocketServerGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private readonly config: WebSocketConfig,
    private readonly logger: Logger,
  ) {}

  afterInit(server: Server) {
    this.logger.log({
      msg: 'WebSocket server initialized',
      namespace: this.config.namespace,
      corsOrigins: this.config.corsOrigin,
    });
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log({
      msg: 'WebSocket client connected',
      clientId: client.id,
      transport: client.conn.transport.name,
    });
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log({
      msg: 'WebSocket client disconnected',
      clientId: client.id,
    });
  }

  /**
   * Extract channel key from payload (supports string or object formats)
   */
  private extractChannelKey(payload: any): string | null {
    if (typeof payload === 'string') {
      return payload;
    }
    if (payload && typeof payload === 'object') {
      return payload.channelKey || payload.data || payload.inputKey || null;
    }
    return null;
  }

  @SubscribeMessage('subscribe')
  handleSubscribeAndCreateRoom(
    @MessageBody() payload: any,
    @ConnectedSocket() client: Socket,
  ) {
    const channelKey = this.extractChannelKey(payload);
    
    if (!channelKey) {
      this.logger.error({
        msg: 'Subscribe request missing channelKey',
        clientId: client.id,
        payload,
      });
      client.emit('subscribe-error', {
        success: false,
        message: 'channelKey is required',
      });
      return;
    }

    client.join(channelKey);
    
    this.logger.log({
      msg: 'Client subscribed to room',
      clientId: client.id,
      channelKey,
    });

    client.emit('subscribed', {
      success: true,
      channelKey,
      message: 'Successfully subscribed',
    });
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @MessageBody() payload: any,
    @ConnectedSocket() client: Socket,
  ) {
    const channelKey = this.extractChannelKey(payload);
    
    if (!channelKey) {
      this.logger.error({
        msg: 'Unsubscribe request missing channelKey',
        clientId: client.id,
        payload,
      });
      return;
    }

    client.leave(channelKey);
    
    this.logger.log({
      msg: 'Client unsubscribed from room',
      clientId: client.id,
      channelKey,
    });
    
    client.emit('unsubscribed', {
      success: true,
      channelKey,
      message: 'Successfully unsubscribed',
    });
  }

  emitToRoom(room: string, event: string, data: any): void {
    this.server.to(room).emit(event, data);
    this.logger.log({
      msg: 'Message emitted to room',
      room,
      event,
    });
  }
}
