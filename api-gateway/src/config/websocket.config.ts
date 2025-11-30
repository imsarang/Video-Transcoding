import { Injectable } from '@nestjs/common';

@Injectable()
export class WebSocketConfig {
  port: number = process.env.WEBSOCKET_PORT
    ? parseInt(process.env.WEBSOCKET_PORT)
    : 3001;
  corsOrigin: string[] = process.env.WEBSOCKET_CORS_ORIGIN
    ? process.env.WEBSOCKET_CORS_ORIGIN.split(',')
    : ['http://localhost:3000'];
  namespace: string = process.env.WEBSOCKET_NAMESPACE || '/';
}
