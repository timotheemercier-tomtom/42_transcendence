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
  ChatClientMessage,
  ChatJoin,
  ChatMute,
  ChatPass,
  ChatRoomUser,
  ChatServerMessage,
} from 'common';
import { AuthService } from 'src/auth/auth.service';
import {
  Catch,
  WsExceptionFilter,
  ArgumentsHost,
  UseFilters,
} from '@nestjs/common';

@Catch()
export class WebsocketExceptionFilter implements WsExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    client.emit('error', exception.message);
  }
}

@UseFilters(new WebsocketExceptionFilter())
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

  idmap = new Map<string, string>();
  userToClient = new Map<string, Socket>();

  afterInit(server: Server) {
    server.use(async (client: Socket, next) => {
      try {
        const token: any = client.handshake.query.token;
        const user = await this.auth.validateUser(token);

        if (!user) {
          return next(new Error('user does not exist'));
        }

        this.userToClient.set(user.login, client);
        this.idmap.set(client.id, user.login);
      } catch (error) {
        return next(error);
      }
      next();
    });
  }

  handleConnection(client: Socket) {
    console.log(`chat connected: ${client.id} ${this.idmap.get(client.id)}`);
    this.list(client);
    this.sdms(client);
    const user = this.idmap.get(client.id)!;
    this.service.rooms.forEach((v, k) => v.has(user) && client.join(k));
  }

  handleDisconnect(client: Socket) {
    console.log(`chat disconnected: ${client.id}`);
  }

  @SubscribeMessage('public')
  spublic(client: Socket, e: string) {
    const user = this.idmap.get(client.id)!;
    this.service.guardExists(e);
    this.service.guardOwner(e, user);
    this.service.togglePublic(e);
    this._message(
      e,
      `room became ${this.service.isPublic(e) ? 'public' : 'private'}`,
    );
  }

  @SubscribeMessage('join')
  join(client: Socket, e: ChatJoin): void {
    const user = this.idmap.get(client.id)!;
    this.service.guardBanned(e.room, user);
    this.service.guardPass(e.room, e.pass);
    client.join(e.room);
    this.service.getOrCreateRoom(e.room, user);
    this.service.addUser(e.room, user);
    client.emit('join', e.room);
    this._message(e.room, `+ ${user}`);
  }

  @SubscribeMessage('leave')
  leave(client: Socket, e: string): void {
    const user = this.idmap.get(client.id)!;
    this.service.guardExists(e);
    this.service.delUser(e, user);
    client.emit('leave', e);
    this._message(e, `- ${user}`);
    client.leave(e);
  }

  sdms(client: Socket) {
    const user = this.idmap.get(client.id)!;
    client.emit('dms', this.service.getDms(user));
  }

  @SubscribeMessage('dm')
  dm(client: Socket, e: string) {
    const user = this.idmap.get(client.id)!;
    const uclient = this.userToClient.get(e);
    if (!uclient) return;
    this.service.addDm(user, e);
    this.sdms(client);
    this.sdms(uclient);
  }

  _setOwner(e: ChatRoomUser) {
    this.service.setOwner(e.room, e.user);
    this._message(e.room, `${e.user} became owner`);
  }

  @SubscribeMessage('list')
  list(client: Socket) {
    client.emit('list', this.service.getPublic());
  }

  @SubscribeMessage('owner')
  setOwner(client: Socket, e: ChatRoomUser) {
    const user = this.idmap.get(client.id)!;
    this.service.guardExists(e.room);
    this.service.guardOwner(e.room, user);
    this._setOwner(e);
  }

  @SubscribeMessage('pass')
  setPassword(client: Socket, e: ChatPass) {
    const user = this.idmap.get(client.id)!;
    this.service.guardExists(e.room);
    this.service.guardOwner(e.room, user);
    this.service.setPass(e.room, e.pass);
    this._message(e.room, `password is '${e.pass}'`);
  }

  @SubscribeMessage('admin')
  setAdmin(client: Socket, e: ChatRoomUser) {
    const user = this.idmap.get(client.id)!;
    this.service.guardExists(e.room);
    this.service.guardOwner(e.room, user);
    this.service.toggleAdmin(e.room, e.user);
    this._message(
      e.room,
      `${e.user} ${
        this.service.isAdmin(e.room, e.user) ? 'gained' : 'lost'
      } adminship`,
    );
  }

  @SubscribeMessage('ban')
  ban(client: Socket, e: ChatRoomUser) {
    const user = this.idmap.get(client.id)!;
    const uclient = this.userToClient.get(e.user);
    if (!uclient) return;
    this.service.guardExists(e.room);
    this.service.guardAdmin(e.room, user);
    this.service.toggleBanned(e.room, e.user);
    this._message(
      e.room,
      `${this.service.isBanned(e.room, e.user) ? 'banned' : 'unbanned'} ${
        e.user
      }`,
    );
    if (this.service.isBanned(e.room, e.user)) this.leave(uclient, e.room);
  }

  @SubscribeMessage('kick')
  kick(client: Socket, e: ChatRoomUser) {
    const user = this.idmap.get(client.id)!;
    this.service.guardExists(e.room);
    this.service.guardAdmin(e.room, user);
    const uclient = this.userToClient.get(e.user);
    if (!uclient) return;
    this.leave(uclient, e.room);
    this._message(e.room, `kicked ${e.user}`);
  }

  @SubscribeMessage('mute')
  mute(client: Socket, e: ChatMute) {
    const user = this.idmap.get(client.id)!;
    this.service.guardExists(e.room);
    this.service.guardAdmin(e.room, user);
    this.service.addMute(e);
    this._message(
      e.room,
      `muted ${e.user} until ${new Date(e.date).toLocaleString()}`,
    );
  }

  _message(room: string, msg: string) {
    const m: ChatServerMessage = {
      room,
      msg,
      date: new Date().getTime(),
      role: 'server',
      user: '$server',
    };

    this.server.to(m.room).emit('message', m);
  }

  @SubscribeMessage('message')
  message(client: Socket, e: ChatClientMessage): void {
    const user = this.idmap.get(client.id)!;
    if (e.room.startsWith('+')) {
      //guardDmexists
      const uuser = e.room.slice(1);
      const uclient = this.userToClient.get(uuser);
      const msg: ChatServerMessage = {
        ...e,
        user,
        role: 'user',
        date: new Date().getTime(),
      };
      client.emit('message', msg);
      msg.room = '+' + user;
      uclient?.emit('message', msg);
      return;
    }
    this.service.guardExists(e.room);
    this.service.guardUserInRoom(e.room, user);
    this.service.guardMuted(e.room, user);
    const msg: ChatServerMessage = {
      ...e,
      user,
      role: this.service.getRole(e.room, user),
      date: new Date().getTime(),
    };
    this.server.to(msg.room).emit('message', msg);
  }

  @SubscribeMessage('rooms')
  rooms(client: Socket, e: string): void {
    const user = this.idmap.get(client.id)!;
    const rooms: string[] = [];
    this.service.rooms.forEach((users, room) => {
      if (users.has(user)) rooms.push(room);
    });
    client.emit('rooms', rooms);
  }
}
