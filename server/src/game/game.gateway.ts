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
    this.service.create(id);
    return 'ok';
  }

  @SubscribeMessage('join')
  _join(client: Socket, id: string) {
    const user = this.idmap.get(client.id)!;
    this.service.join(id, user);
    return 'ok';
  }
}
