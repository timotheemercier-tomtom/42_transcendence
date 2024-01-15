import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { PMessage } from 'common';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway({ namespace: '/chat/ws', transports: ['websocket'] })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private service: ChatService,
    private auth: AuthService,
  ) {}
  @WebSocketServer()
  server: Server;
  idmap = new Map<string, string>();
  admins = new Map<string, Set<string>>();

  async handleConnection(client: Socket) {
    try {
      const token: any = client.handshake.query.token; // Extract the token from the handshake query
      const user = await this.auth.validateUser(token);

      if (!user) {
        client.disconnect();
        return;
      }

      // Optionally, attach user information to the client object for future reference
      this.idmap.set(client.id, user.username);
    } catch (error) {
      client.disconnect();
    }

    console.log(`Client connected: ${client.id} ${this.idmap.get(client.id)}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  join(client: Socket, payload: string): void {
    const room = this.server.sockets.adapter.rooms.get(payload);
    if (!room) {
      this.admins.set(payload, new Set([client.id]));
    }
    client.join(payload);
    client.emit('join', payload);
  }

  @SubscribeMessage('leave')
  leave(client: Socket, payload: string): void {
    const room = this.server.sockets.adapter.rooms.get(payload);
    if (room) {
      if (this.admins.get(payload)?.has(client.id)) {
        this.admins.get(payload)?.delete(client.id);
      }
    }
    client.leave(payload);

    client.emit('leave', payload);
  }

  isAdmin(client: Socket, user: string) {}

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: PMessage): void {
    this.server.to(payload.room).emit('message', payload);
  }
}
