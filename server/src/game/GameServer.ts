import { V2 } from 'common';
import { GameCommon } from './GameCommon';

export default class GameServer extends GameCommon {
  static MAXUSERS = 2;
  users: string[];
  paddles = new Map<string, number>();

  b!: { p: V2; v: V2 };

  keys: {
    [K in string]: { up: boolean; down: boolean };
  } = {};

  join(user: string) {
    if (this.users.length < GameServer.MAXUSERS) this.users.push(user);
    else throw Error('game is full');
  }

  start() {
    this.on('up', (e: string) => {
      this.keys[e].up = !this.keys[e].up;
    });
    this.on('down', (e: string) => {
      this.keys[e].up = !this.keys[e].up;
    });
    setInterval(() => this.update(), 1000 / 30);
  }

  get paleft() {
    return GameServer.PPAD;
  }

  get paright() {
    return GameServer.PPAD + GameServer.PW;
  }

  get pabottom() {
    return this.pa + GameServer.PH;
  }

  get patop() {
    return this.pa;
  }

  get pbleft() {
    return this.w - (GameServer.PPAD + GameServer.PW);
  }

  get pbright() {
    return this.w - GameServer.PPAD;
  }

  get pbbottom() {
    return this.pb + GameServer.PH;
  }

  get pbtop() {
    return this.pb;
  }

  get bleft() {
    return this.b.p.x - GameServer.BRAD;
  }

  get bbottom() {
    return this.b.p.y + GameServer.BRAD;
  }

  get bright() {
    return this.b.p.x + GameServer.BRAD;
  }

  get btop() {
    return this.b.p.y - GameServer.BRAD;
  }

  getv(v: number) {
    return Math.sqrt(GameServer.BSPEED * GameServer.BSPEED - v * v);
  }

  update() {
    this.users.forEach((user) => {
      if (this.keys[user].up) {
        this.paddles.set(
          user,
          Math.min(
            this.h - GameServer.PH - GameServer.PPAD,
            Math.max(
              GameServer.PPAD,
              this.paddles.get(user)! - GameServer.PSPEED,
            ),
          ),
        );
      } else if (this.keys[user].down) {
        this.paddles.set(
          user,
          Math.min(
            this.h - GameServer.PH - GameServer.PPAD,
            Math.max(
              GameServer.PPAD,
              this.paddles.get(user)! + GameServer.PSPEED,
            ),
          ),
        );
      }
    });

    this.b.p.x += this.b.v.x;
    this.b.p.y += this.b.v.y;

    if (this.btop < 0 || this.bbottom > this.h) {
      this.b.v.y = -this.b.v.y;
    }

    if (this.bleft < 0 || this.bleft > this.w) {
      this.b.p = { x: this.w / 2, y: this.h / 2 };
    }

    const rvy = () => {
      if (Math.abs(this.b.v.x) > GameServer.BSPEED - 0.1) {
        const e =
          Math.random() * (GameServer.BSPEED / 2) + Math.abs(this.b.v.y);
        this.b.v.x = this.getv(e);
        this.b.v.y = e;
      }
    };

    if (
      this.paright > this.bleft &&
      this.patop < this.bbottom &&
      this.pabottom > this.btop
    ) {
      this.b.v.x = -this.b.v.x;
      rvy();
    }

    if (
      this.pbleft < this.bright &&
      this.pbtop < this.bbottom &&
      this.pbbottom > this.btop
    ) {
      this.b.v.x = -this.b.v.x;
      rvy();
    }
  }
}
