import {
  Catch,
  WsExceptionFilter,
  ArgumentsHost,
  UseFilters,
} from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { GameService } from './game.service';
import { AuthService } from 'src/auth/auth.service';

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
  constructor(
    private service: GameService,
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

        this.userToClient.set(user.username, client);
        this.idmap.set(client.id, user.username);
      } catch (error) {
        return next(error);
      }
      next();
    });
  }

  @SubscribeMessage('create')
  _create(client: Socket, id: string) {
    const game = this.service.create(id);
    game.mcb = (e, v) => this.server.to(id).emit(e, v);
    return 'ok';
  }

  @SubscribeMessage('join')
  _join(client: Socket, id: string) {
    const user = this.idmap.get(client.id)!;
    this.service.join(id, user);
    client.join(id);
    return 'ok';
  }

  @SubscribeMessage('join_anon')
  _join_anon(client: Socket, id: string) {
    this.service.join(id, '$anon0');
    return 'ok';
  }

  @SubscribeMessage('up')
  _up(client: Socket, _user: string) {
    const user = this.idmap.get(client.id)!;
    this.service.emit(user, 'up', user);
  }

  @SubscribeMessage('down')
  _down(client: Socket, _user: string) {
    const user = this.idmap.get(client.id)!;
    this.service.emit(user, 'down', user);
  }

  @SubscribeMessage('start')
  _start(client: Socket, id: string) {
    this.service.start(id);
    return 'ok';
  }
}
