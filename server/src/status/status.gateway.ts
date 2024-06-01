import { WebSocketGateway } from '@nestjs/websockets';
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

  async state(user: string, state: StatusType) {
    this.status.set(user, state);
    const friends = await this.friends.getUsersWhoAddedAsFriend(user);
    console.log(friends);

    friends.forEach((v) =>
      this.userToClient.get(v.login)?.emit('state', [user, state]),
    );
  }

  async list(client: Socket, user: string) {
    const friends = await this.friends.getFriends(user);
    const status = friends.map((v) => [
      v.login,
      this.status.get(v.login) ?? 'offline',
    ]);
    client.emit('list', status);
  }

  async handleConnection(client: Socket) {
    const user = this.idmap.get(client.id)!;
    console.log(`status connected: ${client.id} ${user}`);
    this.state(user, 'online');
    this.list(client, user);
    console.log(this.status);
  }

  handleDisconnect(client: Socket) {
    const user = this.idmap.get(client.id)!;
    console.log(`status disconnected: ${client.id} ${user}`);
    this.state(user, 'offline');
  }
}
