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
  public = new Set<string>();
  dms = new Set<string>();

  dump() {
    console.log(
      'idmap',
      this.idmap,
      'admins',
      this.admins,
      'owners',
      this.owners,
      'pass',
      this.pass,
      'banned',
      this.banned,
      'mutes',
      this.mutes,
      'rooms',
      this.rooms,
    );
  }

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
    this.list(client);
    this.sdms(client);
  }

  handleDisconnect(client: Socket) {
    console.log(`chat disconnected: ${client.id}`);
  }

  @SubscribeMessage('public')
  spublic(client: Socket, e: string) {
    if (!this.rooms.has(e)) return;
    if (!this.isOwner(client, e)) return;
    if (this.public.has(e)) this.public.delete(e);
    else this.public.add(e);
    this._message(
      e,
      `room became ${this.public.has(e) ? 'public' : 'private'}`,
    );
  }

  @SubscribeMessage('join')
  join(client: Socket, e: ChatJoin): void {
    const user = this.idmap.get(client.id)!;
    if (this.banned.get(e.room)?.has(user)) {
      client.emit('error', 'you are banned');
      return;
    }
    if ((this.pass.get(e.room) ?? '') != e.pass) {
      console.log(this.pass.get(e.room), '!=', e.pass);

      client.emit('error', 'incorrect password');
      return;
    }
    client.join(e.room);
    const room = this.rooms.get(e.room) ?? new Set();
    if (room.size == 0) {
      const t = {
        room: e.room,
        user,
        on: true,
      };
      this._setOwner(t);
      this.setAdmin(client, t);
    }
    room.add(user);
    this.rooms.set(e.room, room);
    client.emit('join', e.room);
    this._message(e.room, `+ ${user}`);
  }

  @SubscribeMessage('leave')
  leave(client: Socket, e: string): void {
    const room = this.rooms.get(e) ?? new Set();
    const user = this.idmap.get(client.id)!;
    room.delete(user);
    if (room.size == 0) {
      if (this.isAdmin(client, e)) this.admins.get(e)?.delete(user);
      if (this.isOwner(client, e)) this.owners.delete(e);
    }
    this.rooms.set(e, room);
    client.emit('leave', e);
    this._message(e, `- ${user}`);
    client.leave(e);
  }

  sdms(client: Socket) {
    const user = this.idmap.get(client.id)!;
    client.emit(
      'dms',
      Array.from(this.dms)
        .filter((v) => v.split('+').includes(user))
        .map((v) => v.split('+').filter((v) => v != user)[0]),
    );
  }

  @SubscribeMessage('dm')
  dm(client: Socket, e: string) {
    const user = this.idmap.get(client.id)!;
    const uclient = this.userToClient.get(e);
    if (!uclient) return;
    this.dms.add([user, e].sort().join('+'));
    this.sdms(client);
    this.sdms(uclient);
  }

  isAdmin(client: Socket, room: string) {
    return this.admins.get(room)?.has(this.idmap.get(client.id)!);
  }

  isOwner(client: Socket, room: string) {
    return this.owners.get(room) == this.idmap.get(client.id);
  }

  _setOwner(e: ChatRoomUser) {
    this.owners.set(e.room, e.user);
    this._message(e.room, `${e.user} became owner`);
  }

  @SubscribeMessage('list')
  list(client: Socket) {
    client.emit('list', Array.from(this.public.values()));
  }

  @SubscribeMessage('owner')
  setOwner(client: Socket, e: ChatRoomUser) {
    if (!this.rooms.has(e.room)) return;
    if (!this.isOwner(client, e.room)) return;
    this._setOwner(e);
  }

  @SubscribeMessage('pass')
  setPassword(client: Socket, e: ChatPass) {
    if (!this.rooms.has(e.room)) return;
    if (!this.isOwner(client, e.room)) return;
    this.pass.set(e.room, e.pass);
    this._message(e.room, `password is '${e.pass}'`);
  }

  @SubscribeMessage('admin')
  setAdmin(client: Socket, e: ChatRoomUser) {
    if (!this.rooms.has(e.room)) return;
    if (!this.isOwner(client, e.room)) return;
    const admins = this.admins.get(e.room) ?? new Set();
    if (admins.has(e.user)) admins.delete(e.user);
    else admins.add(e.user);
    this.admins.set(e.room, admins);
    this._message(
      e.room,
      `${e.user} ${admins.has(e.user) ? 'gained' : 'lost'} adminship`,
    );
  }

  @SubscribeMessage('ban')
  ban(client: Socket, e: ChatRoomUser) {
    if (!this.rooms.has(e.room)) return;
    if (!this.isAdmin(client, e.room)) return;
    const bans = this.banned.get(e.room) ?? new Set();
    if (bans.has(e.user)) bans.delete(e.user);
    else bans.add(e.user);
    this.banned.set(e.room, bans);
    this._message(
      e.room,
      `${bans.has(e.user) ? 'banned' : 'unbanned'} ${e.user}`,
    );
  }

  @SubscribeMessage('kick')
  kick(client: Socket, e: ChatRoomUser) {
    this.dump();
    if (!this.rooms.has(e.room)) return;
    if (!this.isAdmin(client, e.room)) return;
    const uclient = this.userToClient.get(e.user);
    if (!uclient) return;
    this.leave(uclient, e.room);
    this._message(e.room, `kicked ${e.user}`);
  }

  @SubscribeMessage('mute')
  mute(client: Socket, e: ChatMute) {
    if (!this.rooms.has(e.room)) return;
    if (!this.isAdmin(client, e.room)) return;
    const mutes = this.mutes.get(e.room) ?? [];
    mutes.push(e);
    //TODO: clear old mutes
    this.mutes.set(e.room, mutes);
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
    if (!this.rooms.get(e.room)?.has(user)) return;
    const msg: ChatServerMessage = {
      ...e,
      user,
      role: this.isOwner(client, e.room)
        ? 'owner'
        : this.isAdmin(client, e.room)
          ? 'admin'
          : 'user',
      date: new Date().getTime(),
    };
    const mutes = this.mutes.get(e.room);
    const muted =
      mutes &&
      mutes.reduce(
        (a, c) =>
          a || (c.user == msg.user && c.date > new Date().getTime())
            ? true
            : false,
        false,
      );

    if (!muted) this.server.to(msg.room).emit('message', msg);
  }
}
