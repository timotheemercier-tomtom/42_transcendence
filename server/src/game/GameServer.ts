import { V2 } from 'common';
import { GameCommon } from './GameCommon';

export default class GameServer extends GameCommon {
  static MAXUSERS = 2;
  users: string[];

  b!: { p: V2; v: V2 };

  join(user: string) {
    if (this.users.length < GameServer.MAXUSERS) this.users.push(user);
    else throw Error('game is full');
  }
  update() {}
}
