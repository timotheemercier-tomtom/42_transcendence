import { Injectable } from '@nestjs/common';
import GameServer from './GameServer';

@Injectable()
export class GameService {
  games = new Map<string, GameServer>();

  guardGame(id: string): GameServer {
    if (!this.games.has(id)) throw Error('game does not exist');
    return this.games.get(id)!;
  }

  create(id: string) {
    if (this.games.has(id)) throw Error('game already exists');
    this.games.set(id, new GameServer());
  }

  join(id: string, user: string) {
    const game = this.guardGame(id);
    game.join(user);
  }
}
