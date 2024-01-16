import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import {
  ChatAdmin,
  ChatBan,
  ChatClientMessage,
  ChatKick,
  ChatMute,
  ChatOwner,
  ChatPass,
  ChatServerMessage,
} from 'common';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway({ namespace: '/chat/ws', transports: ['websocket'] })
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    private service: ChatService,
    private auth: AuthService,
  ) {}

  @WebSocketServer()
  server: Server;

  _userchannel = new Map<string, Set<string>>();

  idmap = new Map<string, string>();
  userToClient = new Map<string, Socket>();
  admins = new Map<string, Set<string>>();
  owners = new Map<string, string>();
  pass = new Map<string, string>();
  banned = new Map<string, Set<string>>();
  mutes = new Map<string, ChatMute[]>();
  rooms = new Map<string, Set<string>>();

  afterInit(server: Server) {
    server.use(async (client: Socket, next) => {
      try {
        const token: any = client.handshake.query.token;
        const user = await this.auth.validateUser(token);

        if (!user) {
          return next(new Error('user does not exist'));
        }
        this.userToClient.set(user.username, client);
        this.idmap.set(client.id, user.username);
      } catch (error) {
        return next(error);
      }
      next();
    });
  }

  handleConnection(client: Socket) {
    console.log(`chat connected: ${client.id} ${this.idmap.get(client.id)}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`chat disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  join(client: Socket, payload: string): void {
    client.join(payload);
    const user = this.idmap.get(client.id)!;
    const room = this.rooms.get(payload) ?? new Set();
    room.add(user);
    if (room.size == 1) {
      const t = {
        room: payload,
        user,
      };
      this._setOwner(t);
      this.setAdmin(client, t);
    }
    this.rooms.set(payload, room);
    this.server.to(payload).emit('join', { room: payload, user });
  }

  @SubscribeMessage('leave')
  leave(client: Socket, payload: string): void {
    const room = this.rooms.get(payload) ?? new Set();
    const user = this.idmap.get(client.id)!;
    room.delete(user);
    if (room.size == 0) {
      if (this.isAdmin(client, payload)) this.admins.get(payload)?.delete(user);
      if (this.isOwner(client, payload)) this.owners.delete(payload);
    }
    this.rooms.set(payload, room);
    this.server.to(payload).emit('leave', { room: payload, user });
    client.leave(payload);
  }

  isAdmin(client: Socket, room: string) {
    return this.admins.get(room)?.has(this.idmap.get(client.id)!);
  }

  isOwner(client: Socket, room: string) {
    return this.owners.get(room) == this.idmap.get(client.id);
  }

  _setOwner(payload: ChatOwner) {
    this.owners.set(payload.room, payload.user);
    this.server.to(payload.room).emit('owner', payload);
  }

  @SubscribeMessage('owner')
  setOwner(client: Socket, payload: ChatOwner) {
    if (!this.isOwner(client, payload.room)) return;
    this._setOwner(payload);
  }

  @SubscribeMessage('pass')
  setPassword(client: Socket, payload: ChatPass) {
    if (!this.isOwner(client, payload.room)) return;
    this.pass.set(payload.room, payload.pass);
    this.server.to(payload.room).emit('pass', payload);
  }

  @SubscribeMessage('admin')
  setAdmin(client: Socket, payload: ChatAdmin) {
    if (!this.isOwner(client, payload.room)) return;
    const admins = this.admins.get(payload.room) ?? new Set();
    if (admins.has(payload.user)) admins.delete(payload.user);
    else admins.add(payload.user);
    this.admins.set(payload.room, admins);
    this.server.to(payload.room).emit('admin', payload);
  }

  @SubscribeMessage('ban')
  ban(client: Socket, payload: ChatBan) {
    if (!this.isAdmin(client, payload.room)) return;
    const bans = this.banned.get(payload.room) ?? new Set();
    if (bans.has(payload.user)) bans.delete(payload.user);
    else bans.add(payload.user);
    this.banned.set(payload.room, bans);
    this.server.to(payload.room).emit('ban', payload);
  }

  @SubscribeMessage('kick')
  kick(client: Socket, payload: ChatKick) {
    if (!this.isAdmin(client, payload.room)) return;
    const uclient = this.userToClient.get(payload.user);
    if (uclient) this.leave(uclient, payload.room);
    this.server.to(payload.room).emit('kick', payload);
  }

  @SubscribeMessage('mute')
  mute(client: Socket, payload: ChatMute) {
    if (!this.isAdmin(client, payload.room)) return;
    const mutes = this.mutes.get(payload.room) ?? [];
    mutes.push(payload);
    //TODO: clear old mutes
    this.mutes.set(payload.room, mutes);
    this.server.to(payload.room).emit('mute', payload);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: ChatClientMessage): void {
    const msg: ChatServerMessage = {
      ...payload,
      user: this.idmap.get(client.id)!,
      role: this.isOwner(client, payload.room)
        ? 'owner'
        : this.isAdmin(client, payload.room)
          ? 'admin'
          : 'user',
    };
    const mutes = this.mutes.get(payload.room);
    const muted =
      mutes &&
      mutes.reduce(
        (a, c) =>
          a || (c.user == msg.user && c.date > new Date().getTime())
            ? true
            : false,
        false,
      );

    this.server.to(msg.room).emit('message', msg);
  }
}
