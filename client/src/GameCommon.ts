type EvCb<T> = (e: T) => void;

export class GameCommon {
  static PSPEED = 15;
  static BSPEED = 10;
  static BRAD = 10;
  static PW = 20;
  static PH = 100;
  static PPAD = 10;

  pa!: number;
  pb!: number;
  w!: number;
  h!: number;

  events = new Map<string, Set<EvCb<unknown>>>();

  emit(e: string, v: unknown) {
    const cbs = this.events.get(e) ?? new Set();
    Array.from(cbs).forEach((f) => f(v));
  }

  on<T>(e: string, cb: (e: T) => void) {
    const cbs = this.events.get(e) ?? new Set();
    cbs.add(cb);
    this.events.set(e, cbs);
  }

  off<T>(e: string, cb: (e: T) => void) {
    const cbs = this.events.get(e) ?? new Set();
    cbs.delete(cb);
    this.events.set(e, cbs);
  }
}
