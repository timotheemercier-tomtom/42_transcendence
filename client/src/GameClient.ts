import { GameCommon, V2 } from './GameCommon';
import { socket } from './game.socket';

export default class GameClient extends GameCommon {
  ctx!: CanvasRenderingContext2D;
  keys = {
    w: false,
    s: false,
    i: false,
    k: false,
  };
  evdown!: (e: KeyboardEvent) => void;
  evup!: (e: KeyboardEvent) => void;
  userId!: string;
  frameid!: number;
  iv!: unknown;

  get ug() {
    return { userId: this.userId, gameId: this.gameId };
  }

  load(ctx: CanvasRenderingContext2D, userId: string, gameId: string) {
    this.unload();
    this.ctx = ctx;
    this.userId = userId;
    this.create(GameClient.W, GameClient.H);
    this.frameid = 0;
    this.gameId = gameId;

    this.evdown = ((e: KeyboardEvent) => {
      if (e.repeat) return;
      this.onkeychange(e.key);
      if (e.key in this.keys) this.keys[e.key as keyof typeof this.keys] = true;
    }).bind(this);
    this.evup = ((e: KeyboardEvent) => {
      if (e.repeat) return;
      this.onkeychange(e.key);
      if (e.key in this.keys)
        this.keys[e.key as keyof typeof this.keys] = false;
    }).bind(this);

    socket.connect();

    this.onAny = socket.emit.bind(socket);
    socket.onAny((e, v) => {
      this.emit(e, v, false)
      // console.log(e, v);
    });

    this.on('frame', (e) => {
      this.ball_xpos = e.ball_xpos;
      this.ball_ypos = e.ball_ypos;
      this.pa = e.playerA;
      this.pb = e.playerB;
    });
    // this.emit('create', this.ug);
    // this.emit('join', this.ug);

    this.on('join', (v) => {
      this.userI.set(v.userId, this.users.size);
      this.users.add(v.userId);
    });

    this.on('leave', (v) => {
      this.users.delete(v.userId);
      this.userI.delete(v.userId);
    });

    this.on('opt', (v) => this.addOpt(v));
    socket.emit('opt', { gameId: this.gameId, user: {} });
    window.addEventListener('keydown', this.evdown);
    window.addEventListener('keyup', this.evup);
    this.draw();
  }

  unload() {
    window.removeEventListener('keydown', this.evdown);
    window.removeEventListener('keyup', this.evup);
    cancelAnimationFrame(this.frameid);
    socket.disconnect();
    // clearInterval(this.iv);
  }

  start() {
    this.emit('start', this.gameId);
  }

  joinAnon() {
    this.emit('join_anon', this.ug);
  }

  onkeychange(key: string) {
    if (key == 'w') this.emit('up', this.userId);
    else if (key == 's') this.emit('down', this.userId);
  }

  _draw = this.draw.bind(this);

  draw() {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.w, this.h);
    this.ctx.strokeStyle = 'white';

    let c = this.opt.user[this.getUserForPa()]?.paddle ?? 'white';
    this.ctx.fillStyle = c;
    this.ctx.fillRect(GameCommon.PPAD, this.pa, GameCommon.PW, GameCommon.PH);

    c = this.opt.user[this.getUserForPb()]?.paddle ?? 'white';
    this.ctx.fillStyle = c;
    this.ctx.fillRect(GameCommon.W - (GameCommon.PPAD + GameCommon.PW), this.pb, GameCommon.PW, GameCommon.PH);

    this.ctx.fillStyle = 'white';

    this.ctx.beginPath();
    this.ctx.arc(this.ball_xpos, this.ball_ypos, GameCommon.BRAD, 0, 2 * Math.PI, false);
    this.ctx.fill();

    this.frameid = requestAnimationFrame(this._draw);
  }
}
