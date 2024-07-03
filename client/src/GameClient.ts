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
      this.selfBalancingFactor = e.selfBalancingFactor;
    });

    this.on('game_state', (v) => {
      this.gameState = v.gameState;
      this.playerA = v.playerA;
      this.playerB = v.playerB;
      this.spectators = new Set([...v.spectators]);
      this.textMsg = v.textMsg;
    });

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
    // set dimensions
    const canvasWidth: number = this.w * this.scaleFactor;
    const canvasHeight: number = this.h * this.scaleFactor;
    const paddleWidth: number = GameCommon.PW * this.scaleFactor;
    const paddleHeightA: number =
      GameCommon.PH *
      this.scaleFactor *
      (this.scoreA < this.scoreB ? this.selfBalancingFactor : 1);
    const paddleHeightB: number =
      GameCommon.PH *
      this.scaleFactor *
      (this.scoreB < this.scoreA ? this.selfBalancingFactor : 1);
    const padding: number = GameCommon.PPAD * this.scaleFactor;
    const leftPaddleA: number = padding;
    const leftPaddleB: number = canvasWidth - (padding + paddleWidth);
    const topPaddleA: number = this.pa * this.scaleFactor;
    const topPaddleB: number = this.pb * this.scaleFactor;
    const ballXpos: number = this.ballXpos * this.scaleFactor;
    const ballYpos: number = this.ballYpos * this.scaleFactor;
    const ballRadius: number = GameCommon.BRAD * this.scaleFactor;
    const scoreFontSize: number = 40 * this.scaleFactor;
    const scoreXpos: number = 10 * this.scaleFactor;
    const scoreYpos: number = 50 * this.scaleFactor;
    const msgFontSize: number = 25 * this.scaleFactor;
    const msgXpos: number = 50 * this.scaleFactor;
    const msgYpos: number = 250 * this.scaleFactor;

    // field
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    this.ctx.strokeStyle = 'white';

    // paddle A
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(leftPaddleA, topPaddleA, paddleWidth, paddleHeightA);

    // paddle B
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(leftPaddleB, topPaddleB, paddleWidth, paddleHeightB);

    // ball
    this.ctx.fillStyle = 'white';
    this.ctx.beginPath();
    this.ctx.arc(ballXpos, ballYpos, ballRadius, 0, 2 * Math.PI, false);
    this.ctx.fill();

    // score
    const scoreStr: string = `Score: ${this.scoreA} - ${this.scoreB}`;
    this.ctx.fillStyle = 'green';
    this.ctx.font = `bold italic ${scoreFontSize}px Arial`;
    this.ctx.fillText(scoreStr, scoreXpos, scoreYpos);

    // extra msg
    this.ctx.fillStyle = 'cyan';
    this.ctx.font = `bold ${msgFontSize}px Arial`;
    if (this.textMsg) this.ctx.fillText(this.textMsg, msgXpos, msgYpos);

    this.frameid = requestAnimationFrame(this._draw);
  }
}
