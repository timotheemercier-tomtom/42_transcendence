import { WsException } from '@nestjs/websockets';
import { GameCommon, GameOpt, GameEventData } from './GameCommon';
import { updateFrame } from './physics';

export default class GameServer extends GameCommon {
  keys: {
    [K in string]: { up: boolean; down: boolean };
  } = {};

  constructor(gameId: string) {
    super();
    this.gameId = gameId;
  }

  addOpt(opt: GameOpt): void {
    super.addOpt(opt);
    this.emit('opt', this.opt);
  }

  join(userId: string) {
    if (this.userA == userId || this.userB == userId)
      throw new WsException('user already in this game');
    if (this.userA && this.userB) throw new WsException('game is full');
    if (!this.userA) {
      this.userA = userId;
    } else if (!this.userB) {
      this.userB = userId;
    }
    this.keys[userId] = { up: false, down: false };
    this.emit('join', { userId: userId, gameId: this.gameId });
  }

  leave(userId: string) {
    if (this.userA == userId) {
      this.userA = undefined;
    } else if (this.userB == userId) {
      this.userB = undefined;
    } else {
      throw new WsException('user not in this game');
    }
    this.emit('leave', { userId: userId, gameId: this.gameId });
  }

  start(gameId: string) {
    console.log("starting game '" + gameId + "'!");

    // activate key listeners
    this.on('up', (e: string) => {
      this.keys[e].up = !this.keys[e].up;
    });
    this.on('down', (e: string) => {
      this.keys[e].down = !this.keys[e].down;
    });

    let frame: GameEventData['frame'] = {
      playerA: this.pa,
      playerB: this.pb,
      ball_xpos: this.ball_xpos,
      ball_ypos: this.ball_ypos,
      ball_angle_rad: this.ball_angle_rad,
    };

    // temp solution for 1-player game
    const updater = () => {
      if (this.userA) {
        let keyUp: boolean = this.keys[this.userA].up;
        let keydown: boolean = this.keys[this.userA].down;
        updateFrame(frame, keyUp, keydown);
        this.emit('frame', frame);
      }
    };
    setInterval(() => updater(), GameCommon.FRAMEDELAY);
  }

  destroy(): void {
    super.destroy();
  }
}
