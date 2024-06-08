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

  guardUserInGame(user: string): GameServer {
    const gameid = this.userToGame.get(user);
    if (gameid) return this.guardGame(gameid);
    throw new WsException('user not in game');
  }

  create(createMsg: GameEventData['create']) {
    if (this.games.has(createMsg.gameId))
      throw new WsException('game already exists');
    const game = new GameServer(
      createMsg.gameId,
      createMsg.isPublic,
      this.userService,
    );
    game.create(GameServer.W, GameServer.H);
    this.games.set(createMsg.gameId, game);
    this.emit('create', createMsg);
  }

  start(gameId: string) {
    const game = this.guardGame(gameId);
    game.start(gameId);
  }

  destroy(id: string) {
    const game = this.guardGame(id);
    game.destroy();
  }

  join(id: string, user: string) {
    const game = this.guardGame(id);
    if (this.userToGame.get(user))
      throw new WsException('user already in a game');
    game.join(user);
    this.userToGame.set(user, id);
  }

  leave(id: string, user: string) {
    const game = this.guardGame(id);
    game.leave(user);
    this.userToGame.delete(user);
  }

  key_change(userId: string, key_change: GameEventData['key_change']) {
    const game = this.guardUserInGame(userId);
    game.emit('key_change', key_change);
  }

  passGameEvent<E extends GameEventType>(
    user: string,
    e: E,
    v: GameEventData[E],
  ) {
    const game = this.guardUserInGame(user);
    game.emit(e, v);
  }

  enque(user: string) {
    console.log('enque', user);
    if (this.userToGame.has(user))
      throw new WsException('user already in a game');
    // join existing public game
    for (const [gameId, game] of this.games.entries()) {
      if (
        game.isPublic &&
        game.gameState == GameState.WaitingForPlayers &&
        (!game.userA || !game.userB)
      ) {
        return this.join(gameId, user);
      }
    }
    // create new game
    const id = 'game-' + randomUUID();
    this.create({ gameId: id, userId: user, isPublic: true });
    this.join(id, user);
  }

  opt(opt: GameOpt) {
    const game = this.guardGame(opt.gameId);
    game.addOpt(opt);
  }
}
