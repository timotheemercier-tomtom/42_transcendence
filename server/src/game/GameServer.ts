import { WsException } from '@nestjs/websockets';
import { GameCommon, GameOpt, V2 } from './GameCommon';

export default class GameServer extends GameCommon {
  static MAXUSERS = 2;

  b!: { p: V2; v: V2 };

  keys: {
    [K in string]: { up: boolean; down: boolean };
  } = {};

  constructor(id: string) {
    super();
    this.id = id;
  }

  addOpt(opt: GameOpt): void {
    super.addOpt(opt);
    this.emit('opt', this.opt);
  }

  join(user: string) {
    if (this.users.has(user))
      throw new WsException('user already in this game');
    if (this.users.size < GameServer.MAXUSERS) this.users.add(user);
    else throw new WsException('game is full');
    this.keys[user] = { up: false, down: false };
    this.userI.set(user, this.users.size - 1);
    this.emit('join', { userId: user, gameId: this.id });
  }

  leave(user: string) {
    if (!this.users.has(user)) throw new WsException('user not in this game');
    this.users.delete(user);
    this.userI.delete(user);
    this.emit('leave', { userId: user, gameId: this.id });
  }

  start() {
    this.b = { p: { x: this.w / 2, y: this.h / 2 }, v: { x: 0, y: 0 } };
    this.on('up', (e: string) => {
      console.log('up', e);

      this.keys[e].up = !this.keys[e].up;
    });
    this.on('down', (e: string) => {
      console.log('down', e);

      this.keys[e].down = !this.keys[e].down;
    });
    setInterval(() => this.update(), 1000 / 60);
    this.emit('start', this.id);
  }

  destroy(): void {
    super.destroy();
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
    const clamp = (v: number) =>
      Math.min(
        this.h - GameServer.PH - GameServer.PPAD,
        Math.max(GameServer.PPAD, v),
      );
    this.users.forEach((user) => {
      const i = this.userI.get(user)!;
      if (this.keys[user]?.up) {
        this.p[i] = clamp(this.p[i] - GameServer.PSPEED);
      } else if (this.keys[user]?.down) {
        this.p[i] = clamp(this.p[i] + GameServer.PSPEED);
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
    const frame = { pa: this.pa, pb: this.pb, b: this.b };

    this.emit('frame', frame);
  }
}
