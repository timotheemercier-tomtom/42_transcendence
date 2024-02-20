import { V2 } from 'common';
import { GameCommon } from './game_common';

export default class GameServer extends GameCommon {
  static MAXUSERS = 2;
  users: string[];

  pa!: number;
  pb!: number;
  b!: { p: V2; v: V2 };
  w!: number;
  h!: number;

  join(user: string) {
    if (this.users.length < GameServer.MAXUSERS) this.users.push(user);
    else throw Error('game is full');
  }
  update() {}
}
