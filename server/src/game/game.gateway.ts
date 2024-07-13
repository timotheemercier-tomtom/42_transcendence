import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { Eventer, GameEventData, GameType } from './GameCommon';
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

    // adding internal listeners
    this.service.on('create', (createMsg) => {
      const game = this.service.guardGame(createMsg.gameId);

      // send outgoing messages to all users in the game room
      game.onAny = (e, v) => {
        // if (e != 'frame') {
        // console.log('emtting: ', e, v);
        // console.log('to spectators: ', game.spectators);
        // }
        for (const spectator of game.spectators) {
          const client: Socket | undefined = this.userToClient.get(spectator);
          if (client) {
            client.emit(e, v);
          }
        }
      };
      game.on('join_game_room', (ug) => {
        const client = this.userToClient.get(ug.userId)!;
        if (client) client.join(ug.gameId); // join socket.io 'room'
      });
    });
  }

  handleConnection(client: Socket) {
    const user = this.idmap.get(client.id)!;
    console.log(`game client connected: ${client.id} ${user}`);
  }

  handleDisconnect(client: Socket) {
    const user = this.idmap.get(client.id)!;
    console.log(`game disconnected: ${client.id} ${user}`);
    const leftGameId = this.service.userToGame.get(user);
    if (user && leftGameId) {
      this.service.leaveGameRoom(leftGameId, user);
    }
  }

  @SubscribeMessage('create')
  _create(client: Socket, createMsg: GameEventData['create']) {
    const userId = this.idmap.get(client.id)!;
    this.service.createAndJoin({
      userId: userId,
      gameId: createMsg.gameId,
      isPublic: createMsg.isPublic,
      gameType: createMsg.gameType,
    });
  }

  @SubscribeMessage('join')
  _join(client: Socket, ug: GameEventData['join']) {
    const user = this.idmap.get(client.id)!;
    this.service.join(ug.gameId, user);
  }

  @SubscribeMessage('join_game_room')
  _joinGameRoom(client: Socket, ug: GameEventData['join_game_room']) {
    const user = this.idmap.get(client.id)!;
    if (!this.service.games.has(ug.gameId)) {
      this.service.createAndJoin({
        userId: ug.userId,
        gameId: ug.gameId,
        isPublic: true,
        gameType: GameType.Classic,
      });
    } else {
      this.service.joinGameRoom(ug.gameId, user);
    }
  }

  @SubscribeMessage('leave')
  _leave(client: Socket, ug: GameEventData['leave']) {
    const user = this.idmap.get(client.id)!;
    this.service.leave(ug.gameId, user);
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
  _enque(client: Socket, queItem: GameEventData['enque']) {
    const user = this.idmap.get(client.id)!;
    this.service.enque(queItem.userId, queItem.gameType);
  }

  @SubscribeMessage('request_game_state')
  _request_game_state(
    client: Socket,
    gameId: GameEventData['request_game_state'],
  ) {
    const game = this.service.guardGame(gameId);
    const user = this.idmap.get(client.id)!;
    game.spectators.add(user);
    if (game)
      client.emit('game_state', {
        gameState: game.gameState,
        playerA: game.playerA,
        playerB: game.playerB,
        spectators: Array.from(game.spectators),
        textMsg: undefined,
        gameType: game.isSelfBalancing
          ? GameType.SelfBalancing
          : GameType.Classic,
        isPublic: game.isPublic,
        scoreA: game.scoreA,
        scoreB: game.scoreB,
      });
  }
}
