import { Injectable } from '@nestjs/common';
import GameServer from './GameServer';
import {
  Eventer,
  GameEventData,
  GameEventType,
  GameOpt,
  GameUserGame,
} from './GameCommon';
import { randomUUID } from 'crypto';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class GameService extends Eventer {
  games = new Map<string, GameServer>();
  userToGame = new Map<string, string>();
  gameToUsers = new Map<string, Set<string>>();

  guardGame(id: string): GameServer {
    if (!this.games.has(id)) throw new WsException('game does not exist');
    return this.games.get(id)!;
  }

  guardUserInGame(user: string): GameServer {
    const gameid = this.userToGame.get(user);
    if (gameid) return this.guardGame(gameid);
    throw new WsException('user not in game');
  }

  create(ug: GameUserGame) {
    if (this.games.has(ug.gameId)) throw new WsException('game already exists');
    const game = new GameServer(ug.gameId);
    game.create(GameServer.W, GameServer.H);
    this.games.set(ug.gameId, game);
    this.gameToUsers.set(ug.gameId, new Set());
    this.emit('create', ug);
  }

  start(id: string) {
    const game = this.guardGame(id);
    game.start();
    // this.emit('start', id);
  }

  destroy(id: string) {
    const game = this.guardGame(id);
    game.destroy();
    this.gameToUsers.get(id)?.forEach((v) => this.userToGame.delete(v));
    this.gameToUsers.delete(id);
  }

  join(id: string, user: string) {
    const game = this.guardGame(id);
    if (this.userToGame.get(user))
      throw new WsException('user already in a game');
    game.join(user);
    this.userToGame.set(user, id);
    this.gameToUsers.get(id)?.add(user);
    // this.emit('join', { user, id });
  }

  leave(id: string, user: string) {
    const game = this.guardGame(id);
    game.leave(user);
    this.userToGame.delete(user);
    this.gameToUsers.get(id)?.delete(user);
    // this.emit('leave', { user, id });
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
    for (const [k, v] of this.gameToUsers.entries())
      if (v.size < GameServer.MAXUSERS && this.userToGame.get(user) != k)
        return this.join(k, user);
    const id = 'game-' + randomUUID();
    this.create({ gameId: id, userId: user });
    this.join(id, user);
  }

  opt(opt: GameOpt) {
    const game = this.guardGame(opt.gameId);
    game.addOpt(opt);
  }
}
