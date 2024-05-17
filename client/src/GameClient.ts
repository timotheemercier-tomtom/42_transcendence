import { GameCommon, V2 } from './GameCommon';
import { socket } from './game.socket';

export default class GameClient extends GameCommon {
  ctx!: CanvasRenderingContext2D;
  b!: V2;
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

    this.b = { x: this.w / 2, y: this.h / 2 };

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
      console.log('frame');

      this.b = e.b.p;
      this.pa = e.pa;
      this.pb = e.pb;
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
    // this.iv = setInterval(() => {
    //   this.update();
    // }, 1000 / 30);

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
    this.emit('test', {userId: this.userId, gameId: this.gameId});
  }

  joinAnon() {
    this.emit('join_anon', this.ug);
  }

  onkeychange(key: string) {
    if (key == 'w') this.emit('up', this.userId);
    else if (key == 's') this.emit('down', this.userId);
  }

  update() {
    if (this.keys.i) {
      this.pb = Math.min(
        this.h - GameClient.PH - GameClient.PPAD,
        Math.max(GameClient.PPAD, this.pb - GameClient.PSPEED),
      );
    } else if (this.keys.k) {
      this.pb = Math.min(
        this.h - GameClient.PH - GameClient.PPAD,
        Math.max(GameClient.PPAD, this.pb + GameClient.PSPEED),
      );
    }
  }

  _draw = this.draw.bind(this);

  draw() {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.w, this.h);

    this.ctx.strokeStyle = 'white';
    // console.log(this.opt.user[this.getUserForPa()], this.getUserForPa());

    let c = this.opt.user[this.getUserForPa()]?.paddle ?? 'white';
    this.ctx.fillStyle = c;
    this.ctx.fillRect(10, this.pa, 20, 100);

    c = this.opt.user[this.getUserForPb()]?.paddle ?? 'white';
    this.ctx.fillStyle = c;
    this.ctx.fillRect(this.ctx.canvas.width - 30, this.pb, 20, 100);

    this.ctx.fillStyle = 'white';

    this.ctx.beginPath();
    this.ctx.arc(this.b.x, this.b.y, 10, 0, 2 * Math.PI, false);
    this.ctx.fill();

    this.frameid = requestAnimationFrame(this._draw);
  }
}
