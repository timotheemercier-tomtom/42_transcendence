export enum KeyState {
  Released,
  Pressed,
}

export enum GameState {
  WaitingForPlayers,
  ReadyToStart,
  Running,
  Finished,
}

export type GameEventType =
  | 'create'
  | 'enque'
  | 'join'
  | 'join_game_room'
  | 'leave'
  | 'start'
  | 'frame'
  | 'game_state'
  | 'request_game_state'
  | 'key_change'
  | 'opt';

export type GameUserGame = {
  userId: string;
  gameId: string;
};

export type GameOpt = {
  user: { [K in string]: { i: number; ball: string; paddle: string } };
  gameId: string;
};

export type GameEventData = {
  create: {
    userId: string;
    gameId: string;
    isPublic: boolean;
  };
  enque: string;
  join: GameUserGame;
  join_game_room: GameUserGame;
  leave: GameUserGame;
  start: string;
  frame: {
    playerA: number; // paddle postion of player A
    playerB: number; // paddle postion of player B
    ballXpos: number;
    ballYpos: number;
    ballAngle: number;
    scoreA: number;
    scoreB: number;
  };
  game_state: {
    gameState: GameState;
    playerA: string | undefined;
    playerB: string | undefined;
    spectators: Array<string>;
  };
  request_game_state: string;
  key_change: { userId: string; key: string; keyState: KeyState };
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
  static FRAMEDELAY: number = 1000 / 60; // milli seconds per frame

  gameState: GameState = GameState.WaitingForPlayers;
  playerA: string | undefined = undefined;
  playerB: string | undefined = undefined;
  spectators: Set<string> = new Set<string>();
  p: number[] = [];
  ballXpos!: number;
  ballYpos!: number;
  ballAngle!: number; // angle in radians: [0, 2*PI]
  scoreA: number = 0;
  scoreB: number = 0;
  isPublic: boolean = true;

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
  gameId!: string;
  opt: GameOpt = {
    user: {},
    gameId: '',
  };

  addOpt(opt: GameOpt) {
    Object.assign(this.opt.user, opt.user);
    this.opt.gameId = opt.gameId;
  }

  create(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.pa = this.h / 2 - GameCommon.PH / 2;
    this.pb = this.h / 2 - GameCommon.PH / 2;
    this.ballXpos = GameCommon.W / 2;
    this.ballYpos = GameCommon.H / 2;
    this.ballAngle = 1.5 * Math.PI;
  }
  destroy() {}
}
