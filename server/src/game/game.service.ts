import { Injectable } from '@nestjs/common';
import GameServer from './GameServer';
import { GameEventData, GameEventType } from './GameCommon';

@Injectable()
export class GameService {
  games = new Map<string, GameServer>();
  userToGame = new Map<string, string>();
  gameToUsers = new Map<string, Set<string>>();

  guardGame(id: string): GameServer {
    if (!this.games.has(id)) throw Error('game does not exist');
    return this.games.get(id)!;
  }

  guardUserInGame(user: string): GameServer {
    const gameid = this.userToGame.get(user);
    if (gameid) return this.guardGame(gameid);
    throw Error('user not in game');
  }

  create(id: string) {
    if (this.games.has(id)) throw Error('game already exists');
    const game = new GameServer();
    game.create(GameServer.W, GameServer.H);
    this.games.set(id, game);
    this.gameToUsers.set(id, new Set());
    return game;
  }

  start(id: string) {
    const game = this.guardGame(id);
    game.start();
  }

  destroy(id: string) {
    const game = this.guardGame(id);
    game.destroy();
    this.gameToUsers.get(id)?.forEach((v) => this.userToGame.delete(v));
    this.gameToUsers.delete(id);
  }

  join(id: string, user: string) {
    const game = this.guardGame(id);
    if (this.userToGame.get(user)) throw Error('user already in a game');
    game.join(user);
    this.userToGame.set(user, id);
    this.gameToUsers.get(id)?.add(user);
  }

  leave(id: string, user: string) {
    const game = this.guardGame(id);
    game.leave(user);
    this.userToGame.delete(user);
    this.gameToUsers.get(id)?.delete(user);
  }

  emit<E extends GameEventType>(user: string, e: E, v: GameEventData[E]) {
    const game = this.guardUserInGame(user);
    game.emit(e, v);
  }
}
