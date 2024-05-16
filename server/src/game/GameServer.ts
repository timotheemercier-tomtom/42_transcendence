import { WsException } from '@nestjs/websockets';
import { GameCommon, GameOpt, V2, GameEventData } from './GameCommon';
import { calcNewFrame } from './utils';

export default class GameServer extends GameCommon {
  static MAXUSERS = 2;

  b!: { p: V2; v: V2 };

  keys: {
    [K in string]: { up: boolean; down: boolean };
  } = {};

  constructor(gameId: string) {
    super();
    this.gameId = gameId;
  }

  addOpt(opt: GameOpt): void {
    super.addOpt(opt);
    this.emit('opt', this.opt);
  }

  join(userId: string) {
    if (this.users.has(userId))
      throw new WsException('user already in this game');
    if (this.users.size < GameServer.MAXUSERS) this.users.add(userId);
    else throw new WsException('game is full');
    this.keys[userId] = { up: false, down: false };
    this.userI.set(userId, this.users.size - 1);
    this.emit('join', { userId: userId, gameId: this.gameId });
  }

  leave(userId: string) {
    if (!this.users.has(userId)) throw new WsException('user not in this game');
    this.users.delete(userId);
    this.userI.delete(userId);
    this.emit('leave', { userId: userId, gameId: this.gameId });
  }

  test (gameId: string) {

    // set starting positions and speed of the ball
    this.b = { p: { x: this.w / 2, y: this.h / 2 }, v: { x: 0, y: 0 } };

    // activate key listeners
    this.on('up', (e: string) => {
      // console.log('GameServer: up', e);
      console.log("key up!!")
      this.keys[e].up = !this.keys[e].up;
    });
    this.on('down', (e: string) => {
      console.log("key down!!")
      // console.log('GameServer: down', e);
      this.keys[e].down = !this.keys[e].down;
    });

    type frame = GameEventData['frame'];
    type ball = frame['b'];

    // ball
    let curr_ball: ball = {
      p: {x: this.b.p.x, y: this.b.p.y},
      v: {x: this.b.v.x, y: this.b.v.y}
    };

    // paddles
    let pa: number = this.pa;
    let pb: number = this.pb;

    // frame
    let cur_frame: frame = {
      pa: pa,
      pb: pb,
      b: curr_ball
    }

    const updater = () => {

      // keys
      let userA: string = this.users.values().next().value;
      let keyUp: boolean = this.keys[userA].up;
      let keydown: boolean = this.keys[userA].down;
      console.log("key status: ", userA, keyUp, keydown);

      let newframe: frame = calcNewFrame(cur_frame, keyUp, keydown);
      this.b = newframe.b;
      this.pa = newframe.pa;
      this.pb = newframe.pb;
      this.emit('frame', newframe);
    }
    setInterval(() => updater(), 100);
  }

  start(gameId: string) {
    console.log("starting game!");
    this.b = { p: { x: this.w / 2, y: this.h / 2 }, v: { x: 0, y: 0 } };
    // this.on('up', (e: string) => {
    //   console.log('up', e);

    //   this.keys[e].up = !this.keys[e].up;
    // });
    // this.on('down', (e: string) => {
    //   console.log('down', e);

    //   this.keys[e].down = !this.keys[e].down;
    // });
    // setInterval(() => this.update(), 1000 / 60);
    // this.emit('start', this.gameId);

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
