import { V2 } from 'common';
import { GameCommon } from './GameCommon';

export default class GameClient extends GameCommon {
  ctx!: CanvasRenderingContext2D;
  b!: { p: V2; v: V2 };

  evdown!: (e: KeyboardEvent) => void;
  evup!: (e: KeyboardEvent) => void;
  keys = {
    w: false,
    s: false,
    i: false,
    k: false,
  };
  frameid!: number;

  load(ctx: CanvasRenderingContext2D) {
    this.unload();
    this.ctx = ctx;
    this.w = this.ctx.canvas.width;
    this.h = this.ctx.canvas.height;
    this.frameid = 0;
    this.pa = this.h / 2 - GameClient.PH / 2;
    this.pb = this.h / 2 - GameClient.PH / 2;
    this.b = {
      p: { x: this.w / 2, y: this.h / 2 },
      v: { x: -GameClient.BSPEED, y: 0 },
    };

    this.evdown = ((e: KeyboardEvent) => {
      if (e.key in this.keys) this.keys[e.key as keyof typeof this.keys] = true;
    }).bind(this);
    this.evup = ((e: KeyboardEvent) => {
      if (e.key in this.keys)
        this.keys[e.key as keyof typeof this.keys] = false;
    }).bind(this);

    window.addEventListener('keydown', this.evdown);
    window.addEventListener('keyup', this.evup);
    this.draw();
  }

  unload() {
    window.removeEventListener('keydown', this.evdown);
    window.removeEventListener('keyup', this.evup);
    cancelAnimationFrame(this.frameid);
  }

  get paleft() {
    return GameClient.PPAD;
  }

  get paright() {
    return GameClient.PPAD + GameClient.PW;
  }

  get pabottom() {
    return this.pa + GameClient.PH;
  }

  get patop() {
    return this.pa;
  }

  get pbleft() {
    return this.w - (GameClient.PPAD + GameClient.PW);
  }

  get pbright() {
    return this.w - GameClient.PPAD;
  }

  get pbbottom() {
    return this.pb + GameClient.PH;
  }

  get pbtop() {
    return this.pb;
  }

  get bleft() {
    return this.b.p.x - GameClient.BRAD;
  }

  get bbottom() {
    return this.b.p.y + GameClient.BRAD;
  }

  get bright() {
    return this.b.p.x + GameClient.BRAD;
  }

  get btop() {
    return this.b.p.y - GameClient.BRAD;
  }

  getv(v: number) {
    return Math.sqrt(GameClient.BSPEED * GameClient.BSPEED - v * v);
  }

  update() {
    if (this.keys.w) {
      this.pa = Math.min(
        this.h - GameClient.PH - GameClient.PPAD,
        Math.max(GameClient.PPAD, this.pa - GameClient.PSPEED),
      );
    } else if (this.keys.s) {
      this.pa = Math.min(
        this.h - GameClient.PH - GameClient.PPAD,
        Math.max(GameClient.PPAD, this.pa + GameClient.PSPEED),
      );
    } else if (this.keys.i) {
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

    this.b.p.x += this.b.v.x;
    this.b.p.y += this.b.v.y;

    if (this.btop < 0 || this.bbottom > this.h) {
      this.b.v.y = -this.b.v.y;
    }

    if (this.bleft < 0 || this.bleft > this.w) {
      this.b.p = { x: this.w / 2, y: this.h / 2 };
    }

    const rvy = () => {
      if (Math.abs(this.b.v.x) > GameClient.BSPEED - 0.1) {
        const e =
          Math.random() * (GameClient.BSPEED / 2) + Math.abs(this.b.v.y);
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

  draw() {
    this.update();
    this.frameid = requestAnimationFrame(this.draw.bind(this));

    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.w, this.h);
    this.ctx.fillStyle = 'white';
    this.ctx.strokeStyle = 'white';
    this.ctx.fillRect(10, this.pa, 20, 100);
    this.ctx.fillRect(this.ctx.canvas.width - 30, this.pb, 20, 100);

    this.ctx.beginPath();
    this.ctx.arc(this.b.p.x, this.b.p.y, 10, 0, 2 * Math.PI, false);
    this.ctx.fill();
  }
}
