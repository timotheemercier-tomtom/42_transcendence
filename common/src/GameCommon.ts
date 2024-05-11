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
  user: string;
  id: string;
};

export type GameOpt = {
  user: { [K in string]: { i:number, ball: string; paddle: string } };
  id: string;
};

export type GameEventData = {
  up: string;
  down: string;
  frame: {
    pa: number;
    pb: number;
    b: { p: V2; v: V2 };
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
  static W = 800;
  static H = 600;
  static PSPEED = 15;
  static BSPEED = 10;
  static BRAD = 10;
  static PW = 20;
  static PH = 100;
  static PPAD = 10;

  p: number[] = [];
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

  id!: string;
  opt: GameOpt = {
    user: {},
    id: '',
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
    this.opt.id = opt.id;
  }

  create(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.pa = this.h / 2 - GameCommon.PH / 2;
    this.pb = this.h / 2 - GameCommon.PH / 2;
  }

  destroy() {}
}
