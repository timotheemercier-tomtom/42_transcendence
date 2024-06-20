import { GameCommon, GameState, KeyState } from './GameCommon';
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
  textMsg: string | undefined = undefined;
  scaleFactor: number = 1;

  get ug() {
    return { userId: this.userId, gameId: this.gameId };
  }

  load(ctx: CanvasRenderingContext2D, userId: string, gameId: string) {
    this.ctx = ctx;
    this.userId = userId;
    this.create(GameClient.W, GameClient.H);
    this.frameid = 0;
    this.gameId = gameId;

    this.evdown = ((e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key in this.keys && this.gameState == GameState.Running) {
        this.emit('key_change', {
          userId: userId,
          key: e.key,
          keyState: KeyState.Pressed,
        });
      }
    }).bind(this);

    this.evup = ((e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key in this.keys && this.gameState == GameState.Running) {
        this.emit('key_change', {
          userId: userId,
          key: e.key,
          keyState: KeyState.Released,
        });
      }
    }).bind(this);

    this.onAny = (e, v) => {
      console.log('emitting to server: ', e, v);
      socket.emit.bind(socket)(e, v);
    };

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
      this.textMsg = v.textMsg;
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

  calcScaleFactor(screenWidth: number, screenHeight: number): number {
    const fWidth: number = screenWidth / 2 / GameCommon.W;
    const fHeight: number = screenHeight / 2 / GameCommon.H;
    this.scaleFactor = Math.min(fWidth, fHeight);
    return this.scaleFactor;
  }

  draw() {
    const fact = this.scaleFactor;

    // field
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.w * fact, this.h * fact);
    this.ctx.strokeStyle = 'white';

    // paddle A
    let c = this.opt.user[this.playerA!]?.paddle ?? 'white';
    this.ctx.fillStyle = c;
    this.ctx.fillRect(GameCommon.PPAD * fact, this.pa * fact, GameCommon.PW * fact, GameCommon.PH * fact);

    // paddle B
    c = this.opt.user[this.playerB!]?.paddle ?? 'white';
    this.ctx.fillStyle = c;
    this.ctx.fillRect(
      GameCommon.W * fact - (GameCommon.PPAD * fact + GameCommon.PW * fact),
      this.pb * fact,
      GameCommon.PW * fact,
      GameCommon.PH * fact,
    );

    // ball
    this.ctx.fillStyle = 'white';
    this.ctx.beginPath();
    this.ctx.arc(
      this.ballXpos * fact,
      this.ballYpos * fact,
      GameCommon.BRAD * fact,
      0,
      2 * Math.PI,
      false,
    );
    this.ctx.fill();

    // score
    this.ctx.fillStyle = 'green';
    this.ctx.font = 'bold italic 40px Arial';
    this.ctx.fillText('Score: ' + this.scoreA + ' - ' + this.scoreB, 10 * fact, 50 * fact);

    // extra msg
    this.ctx.fillStyle = 'blue';
    this.ctx.font = 'bold 25px Arial';
    if (this.textMsg) this.ctx.fillText(this.textMsg, 50 * fact, 250 * fact);

    this.frameid = requestAnimationFrame(this._draw);
  }
}
