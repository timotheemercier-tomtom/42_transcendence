import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { Eventer, GameEventData } from './GameCommon';
import { GameService } from './game.service';
import { WsException } from '@nestjs/websockets';

// @Catch()
// export class WebsocketExceptionFilter implements WsExceptionFilter<GameError> {
//   catch(exception: GameError, host: ArgumentsHost) {
//     const client = host.switchToWs().getClient();
//     client.emit('error', exception.message);
//   }
// }

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

        this.userToClient.set(user.login, client);
        this.idmap.set(client.id, user.login);
      } catch (error) {
        return next(error);
      }
      next();
    });

    this.service.on('create', (createMsg) => {
      const game = this.service.guardGame(createMsg.gameId);
      game.onAny = (e, v) => {
        if (game.userA) {
          const clientA: Socket | undefined = this.userToClient.get(game.userA);
          if (clientA) clientA.emit(e, v);
        }
        if (game.userB) {
          const clientB: Socket | undefined = this.userToClient.get(game.userB);
          if (clientB) clientB.emit(e, v);
        }
      };
      game.on('leave', (ug) => {
        const client = this.userToClient.get(ug.userId)!;
        if (client) client.leave(ug.gameId);
      });
      game.on('join', (ug) => {
        const client = this.userToClient.get(ug.userId)!;
        if (client) client.join(ug.gameId);
      });
      this.userToClient.get(createMsg.userId)?.emit('create', createMsg);
    });
  }

  @SubscribeMessage('create')
  _create(client: Socket, createMsg: GameEventData['create']) {
    const userId = this.idmap.get(client.id)!;
    this.service.create({
      userId: userId,
      gameId: createMsg.gameId,
      isPublic: createMsg.isPublic,
    });
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

  @SubscribeMessage('key_change')
  _key_change(client: Socket, key_change: GameEventData['key_change']) {
    const user = this.idmap.get(client.id)!;
    if (user != key_change.userId)
      throw new WsException('userId does not match client-userId');
    this.service.key_change(user, key_change);
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

  @SubscribeMessage('request_game_state')
  _request_game_state(
    client: Socket,
    gameId: GameEventData['request_game_state'],
  ) {
    const game = this.service.guardGame(gameId);
    if (game)
      client.emit('game_state', {
        gameState: game.gameState,
        playerA: game.userA,
        playerB: game.userB,
      });
  }
}
