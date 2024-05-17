export type V2 = {
  x: number;
  y: number;
};

export type GameEventType =
  | 'create'
  | 'start'
  | 'join'
  | 'join_anon'
  | 'leave'
  | 'up'
  | 'down'
  | 'frame'
  | 'enque'
  | 'opt';

export type GameUserGame = {
  userId: string;
  gameId: string;
};

export type GameOpt = {
  user: { [K in string]: { i:number, ball: string; paddle: string } };
  gameId: string;
};

export type GameEventData = {
  up: string;
  down: string;
  frame: {
    playerA: number;
    playerB: number;
    ball_xpos: number;
    ball_ypos: number;
    ball_angle_rad: number;
  };
  create: GameUserGame;
  join: GameUserGame;
  join_anon: GameUserGame;
  leave: GameUserGame;
  start: string;
  enque: string;
  opt: GameOpt;
};

type EvCb<T> = (e: T) => void;

export class Eventer {
  onAny?: (e: string, v?: unknown) => void;
  events = new Map<string, Set<EvCb<unknown>>>();

  emit<E extends GameEventType>(e: E, v: GameEventData[E], mcb = true) {
    const cbs = this.events.get(e) ?? new Set();
    Array.from(cbs).forEach((f) => f(v));
    if (mcb) this.onAny?.(e, v);
  }

  on<E extends GameEventType>(e: E, cb: EvCb<GameEventData[E]>) {
    const cbs = this.events.get(e) ?? new Set();
    cbs.add(cb as EvCb<unknown>);
    this.events.set(e, cbs);
  }

  off<E extends GameEventType>(e: E, cb: EvCb<GameEventData[E]>) {
    const cbs = this.events.get(e) ?? new Set();
    cbs.delete(cb as EvCb<unknown>);
    this.events.set(e, cbs);
  }
}

export class GameCommon extends Eventer {
  static W: number = 800;
  static H: number = 600;
  static PSPEED: number = 15;
  static BSPEED: number = 10;
  static BRAD: number = 10;
  static PW: number = 20;
  static PH: number = 100;
  static PPAD: number = 10;
  static FRAMERATE: number = 1000 / 60; // frames per second

  p: number[] = [];
  ball_xpos!: number;
  ball_ypos!: number;
  ball_angle_rad!: number;

  get pa() {
    return this.p[0];
  }
  get pb() {
    return this.p[1];
  }
  set pa(x: number) {
    this.p[0] = x;
  }
  set pb(x: number) {
    this.p[1] = x;
  }
  w!: number;
  h!: number;
  users = new Set<string>();
  userI = new Map<string, number>();

  gameId!: string;
  opt: GameOpt = {
    user: {},
    gameId: '',
  };

  getUserForPa() {
    for (const [k, v] of this.userI.entries()) {
      if (v == 0) return k;
    }
    return '';
  }

  getUserForPb() {
    for (const [k, v] of this.userI.entries()) {
      if (v == 1) return k;
    }
    return '';
  }

  addOpt(opt: GameOpt) {
    Object.assign(this.opt.user, opt.user);
    this.opt.gameId = opt.gameId;
  }

  create(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.pa = this.h / 2 - GameCommon.PH / 2;
    this.pb = this.h / 2 - GameCommon.PH / 2;
    this.ball_xpos = GameCommon.W / 2;
    this.ball_ypos = GameCommon.H / 2;
    this.ball_angle_rad = 0;
  }

  destroy() {}
}
