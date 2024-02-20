import {
  Catch,
  WsExceptionFilter,
  ArgumentsHost,
  UseFilters,
} from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import GameServer from './GameServer';

@Catch()
export class WebsocketExceptionFilter implements WsExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    client.emit('error', exception.message);
  }
}

@UseFilters(new WebsocketExceptionFilter())
@WebSocketGateway({ namespace: '/game/ws', transports: ['websocket'] })
export class GameGateway {
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

  @SubscribeMessage('create')
  _create(client: Socket, e: any) {
    new GameServer();
    return 'hey';
  }
}
