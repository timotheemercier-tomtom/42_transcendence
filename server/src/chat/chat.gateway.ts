import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { PMessage } from '@common';

@WebSocketGateway({ namespace: '/chat/ws', transports: ['websocket'] })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private service: ChatService) {}
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  join(client: Socket, payload: string): void {
    client.join(payload);
    client.emit('join', payload);
  }

  @SubscribeMessage('leave')
  leave(client: Socket, payload: string): void {
    client.leave(payload);
    client.emit('leave', payload);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: PMessage): void {
    this.server.to(payload.room).emit('message', payload);
  }
}
