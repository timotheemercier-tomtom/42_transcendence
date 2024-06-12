import { Injectable } from '@nestjs/common';
import GameServer from './GameServer';
import {
  Eventer,
  GameEventData,
  GameEventType,
  GameOpt,
  GameState,
} from './GameCommon';
import { randomUUID } from 'crypto';
import { WsException } from '@nestjs/websockets';
import { UserService } from 'src/user/user.service';

@Injectable()
export class GameService extends Eventer {
  constructor(private readonly userService: UserService) {
    super();
  }

  games = new Map<string, GameServer>();
  userToGame = new Map<string, string>();

  guardGame(id: string): GameServer {
    if (!this.games.has(id)) throw new WsException('game does not exist');
    return this.games.get(id)!;
  }

  guardUserInGameRoom(user: string): GameServer {
    const gameid = this.userToGame.get(user);
    if (gameid) return this.guardGame(gameid);
    throw new WsException('user not in game');
  }

  createAndJoin(createMsg: GameEventData['create']) {
    if (this.games.has(createMsg.gameId))
      throw new WsException('game already exists');
    const game = new GameServer(
      createMsg.gameId,
      createMsg.isPublic,
      this.userService,
    );
    game.create(GameServer.W, GameServer.H);
    this.games.set(createMsg.gameId, game);
    this.userToGame.set(createMsg.userId, createMsg.gameId);
    this.emit('create', createMsg);  // adds listeners in gateway
    game.joinGameRoom(createMsg.userId);
    game.join(createMsg.userId);
  }

  start(gameId: string) {
    const game = this.guardGame(gameId);
    game.start(gameId);
  }

  destroy(id: string) {
    const game = this.guardGame(id);
    game.destroy();
  }

  joinGameRoom(gameId: string, user: string) {
    const game = this.guardGame(gameId);
    if (this.userToGame.get(user))
      throw new WsException('user already in a game');
    this.userToGame.set(user, gameId);
    game.joinGameRoom(user);
  }

  leaveGameRoom(leftGameId: string, userId: string ) {
    const game = this.guardGame(leftGameId);
    if (this.userToGame.get(userId) != leftGameId)
      throw new WsException('user already left the game');
    game.leaveGameRoom(userId);
    this.userToGame.delete(userId);
  }

  join(id: string, user: string) {
    const game = this.guardGame(id);
    if (!this.userToGame.get(user))
      throw new WsException('user is not yet in the game room');
    game.join(user);
  }

  leave(id: string, user: string) {
    const game = this.guardGame(id);
    game.leave(user);
  }

  key_change(userId: string, key_change: GameEventData['key_change']) {
    const game = this.guardUserInGameRoom(userId);
    game.emit('key_change', key_change);
  }

  passGameEvent<E extends GameEventType>(
    user: string,
    e: E,
    v: GameEventData[E],
  ) {
    const game = this.guardUserInGameRoom(user);
    game.emit(e, v);
  }

  enque(user: string) {
    if (this.userToGame.has(user))
      throw new WsException('user already in a game');
    // join existing public game
    for (const [gameId, game] of this.games.entries()) {
      if (
        game.isPublic &&
        game.gameState == GameState.WaitingForPlayers &&
        (!game.userA || !game.userB)
      ) {
        this.joinGameRoom(gameId, user);
        this.join(gameId, user);
        return ;
      }
    }
    // create new public game
    const id = 'game-' + randomUUID();
    this.createAndJoin({ gameId: id, userId: user, isPublic: true });
  }

  opt(opt: GameOpt) {
    const game = this.guardGame(opt.gameId);
    game.addOpt(opt);
  }
}
