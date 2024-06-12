import { GameCommon, KeyState } from './GameCommon';
import { socket } from './game.socket';

export default class GameClient extends GameCommon {
  ctx!: CanvasRenderingContext2D;
  keys = {
    w: false,
    s: false,
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
      if (e.key in this.keys) {
        this.emit('key_change', {
          userId: userId,
          key: e.key,
          keyState: KeyState.Pressed,
        });
      }
    }).bind(this);

    this.evup = ((e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key in this.keys) {
        this.emit('key_change', {
          userId: userId,
          key: e.key,
          keyState: KeyState.Released,
        });
      }
    }).bind(this);

    socket.connect();

    this.onAny = socket.emit.bind(socket);
    socket.onAny((e, v) => {
      if (e != 'frame') console.log('Received: ', e, v);
      this.emit(e, v, false);
    });

    this.on('frame', (e) => {
      this.ballXpos = e.ballXpos;
      this.ballYpos = e.ballYpos;
      this.pa = e.playerA;
      this.pb = e.playerB;
      this.scoreA = e.scoreA;
      this.scoreB = e.scoreB;
    });

    this.on('game_state', (v) => {
      this.gameState = v.gameState;
      this.playerA = v.playerA;
      this.playerB = v.playerB;
      this.spectators = new Set([...v.spectators]);
    });

    // this.on('opt', (v) => this.addOpt(v));
    // socket.emit('opt', { gameId: this.gameId, user: {} });
    socket.emit('join_game_room', this.ug);
    socket.emit('request_game_state', gameId);
    window.addEventListener('keydown', this.evdown);
    window.addEventListener('keyup', this.evup);
    this.draw();
  }

  unload() {
    window.removeEventListener('keydown', this.evdown);
    window.removeEventListener('keyup', this.evup);
    cancelAnimationFrame(this.frameid);
    console.log('Disconnected GameClient');
    socket.disconnect();
  }

  start() {
    this.emit('start', this.gameId);
  }

  join() {
    this.emit('join', this.ug);
  }

  leave() {
    this.emit('leave', this.ug);
  }

  _draw = this.draw.bind(this);

  draw() {
    // field
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.w, this.h);
    this.ctx.strokeStyle = 'white';

    // paddle A
    let c = this.opt.user[this.playerA!]?.paddle ?? 'white';
    this.ctx.fillStyle = c;
    this.ctx.fillRect(GameCommon.PPAD, this.pa, GameCommon.PW, GameCommon.PH);

    // paddle B
    c = this.opt.user[this.playerB!]?.paddle ?? 'white';
    this.ctx.fillStyle = c;
    this.ctx.fillRect(
      GameCommon.W - (GameCommon.PPAD + GameCommon.PW),
      this.pb,
      GameCommon.PW,
      GameCommon.PH,
    );

    // ball
    this.ctx.fillStyle = 'white';
    this.ctx.beginPath();
    this.ctx.arc(
      this.ballXpos,
      this.ballYpos,
      GameCommon.BRAD,
      0,
      2 * Math.PI,
      false,
    );
    this.ctx.fill();

    // score
    this.ctx.fillStyle = 'green';
    this.ctx.font = 'bold italic 40px Arial';
    this.ctx.fillText('Score: ' + this.scoreA + ' - ' + this.scoreB, 10, 50);

    this.frameid = requestAnimationFrame(this._draw);
  }
}
