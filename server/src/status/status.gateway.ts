import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { StatusType } from 'common';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { FriendService } from 'src/user/friend.service';

@WebSocketGateway({ namespace: '/status/ws', transports: ['websocket'] })
export class StatusGateway {
  constructor(
    private auth: AuthService,
    private friends: FriendService,
  ) {}
  status = new Map<string, StatusType>();
  idmap = new Map<string, string>();
  userToClient = new Map<string, Socket>();

  afterInit(server: Server) {
    server.use(async (client: Socket, next) => {
      try {
        const anon: any = client.handshake.query.anon;
        const token: any = client.handshake.query.token;
        const user = anon
          ? { username: anon }
          : await this.auth.validateUser(token);

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

  state(user: string, state: StatusType) {
    this.status.set(user, state);
  }

  async handleConnection(client: Socket) {
    const user = this.idmap.get(client.id)!;
    console.log(`status connected: ${client.id} ${user}`);
    this.state(user, 'online');
    const friends = await this.friends.getFriends(user);
    const status = friends.map((v) => [
      v.login,
      this.status.get(v.login) ?? 'offline',
    ]);
    client.emit('list', status);
  }

  handleDisconnect(client: Socket) {
    const user = this.idmap.get(client.id)!;
    console.log(`status disconnected: ${client.id} ${user}`);
    this.state(user, 'offline');
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
