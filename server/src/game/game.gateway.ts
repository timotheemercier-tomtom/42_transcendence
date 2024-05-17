import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { Eventer, GameEventData, V2 } from './GameCommon';
import { GameService } from './game.service';

// @Catch()
// export class WebsocketExceptionFilter implements WsExceptionFilter<GameError> {
//   catch(exception: GameError, host: ArgumentsHost) {
//     const client = host.switchToWs().getClient();
//     client.emit('error', exception.message);
//   }
// }

type testMsgType = { userId: string, gameId: string};

// @UseFilters(new WebsocketExceptionFilter())
@WebSocketGateway({ namespace: '/game/ws', transports: ['websocket'] })
export class GameGateway extends Eventer {
  constructor(
    private service: GameService,
    private auth: AuthService,
  ) {
    super();
  }

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

    this.service.on('create', (ug) => {
      const game = this.service.guardGame(ug.gameId);
      game.onAny = (e, v) => {
        const clients = Array.from(game.users.values()).map((v) =>
          this.userToClient.get(v),
        );

        clients.forEach((c) => c?.emit(e, v));
        // this.server.to(ug.id).emit(e, v);
      };
      game.on('leave', (ug) => {
        const client = this.userToClient.get(ug.userId)!;
        // server.to(ug.id).emit('leave', ug);
        if (client) client.leave(ug.gameId);
      });
      game.on('join', (ug) => {
        const client = this.userToClient.get(ug.userId)!;

        if (client) {
          client.join(ug.gameId);
        }

        // server.to(ug.id).emit('join', ug);
      });
      this.userToClient.get(ug.userId)?.emit('create', ug);
    });
  }

  @SubscribeMessage('create')
  _create(client: Socket, ug: GameEventData['create']) {
    const userId = this.idmap.get(client.id)!;
    this.service.create({ gameId: ug.gameId, userId: userId });
  }

  @SubscribeMessage('join')
  _join(client: Socket, ug: GameEventData['join']) {
    const user = this.idmap.get(client.id)!;
    this.service.join(ug.gameId, user);
  }

  @SubscribeMessage('join_anon')
  _join_anon(client: Socket, ug: GameEventData['join_anon']) {
    this.service.join(ug.gameId, '$anon0');
  }

  @SubscribeMessage('up')
  _up(client: Socket) {
    const user = this.idmap.get(client.id)!;
    this.service.passGameEvent(user, 'up', user);
  }

  @SubscribeMessage('down')
  _down(client: Socket) {
    const user = this.idmap.get(client.id)!;
    this.service.passGameEvent(user, 'down', user);
  }

  @SubscribeMessage('start')
  _start(client: Socket, gameId: GameEventData['start']) {
    this.service.start(gameId);
  }

  @SubscribeMessage('enque')
  _enque(client: Socket) {
    const user = this.idmap.get(client.id)!;
    this.service.enque(user);
  }

  @SubscribeMessage('opt')
  _opt(client: Socket, opt: GameEventData['opt']) {
    this.service.opt(opt);
  }
}
