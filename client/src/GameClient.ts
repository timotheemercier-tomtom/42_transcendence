import { V2 } from 'common';
import { GameCommon } from './GameCommon';

export default class GameClient extends GameCommon {
  ctx!: CanvasRenderingContext2D;
  b!: { p: V2; v: V2 };
  keys = {
    w: false,
    s: false,
    i: false,
    k: false,
  };
  evdown!: (e: KeyboardEvent) => void;
  evup!: (e: KeyboardEvent) => void;

  frameid!: number;

  load(ctx: CanvasRenderingContext2D) {
    this.unload();
    this.ctx = ctx;
    this.w = this.ctx.canvas.width;
    this.h = this.ctx.canvas.height;
    this.frameid = 0;
    this.pa = this.h / 2 - GameClient.PH / 2; // pos player a
    this.pb = this.h / 2 - GameClient.PH / 2; // pos player b
    this.b = {                                // ball
      p: { x: this.w / 2, y: this.h / 2 },    // ball position
      v: { x: -GameClient.BSPEED, y: 0 },     // ball speed
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
