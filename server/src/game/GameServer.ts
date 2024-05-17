import { WsException } from '@nestjs/websockets';
import { GameCommon, GameOpt, V2, GameEventData } from './GameCommon';
import { updateFrame } from './physics';

export default class GameServer extends GameCommon {
  static MAXUSERS = 2;

  b!: { p: V2; v: V2 };

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
    if (this.users.has(userId))
      throw new WsException('user already in this game');
    if (this.users.size < GameServer.MAXUSERS) this.users.add(userId);
    else throw new WsException('game is full');
    this.keys[userId] = { up: false, down: false };
    this.userI.set(userId, this.users.size - 1);
    this.emit('join', { userId: userId, gameId: this.gameId });
  }

  leave(userId: string) {
    if (!this.users.has(userId)) throw new WsException('user not in this game');
    this.users.delete(userId);
    this.userI.delete(userId);
    this.emit('leave', { userId: userId, gameId: this.gameId });
  }

  start(gameId: string) {
    console.log("starting game '" + gameId + "'!");

    // activate key listeners
    this.on('up', (e: string) => {
      console.log("key up!!")
      this.keys[e].up = !this.keys[e].up;
    });
    this.on('down', (e: string) => {
      console.log("key down!!")
      this.keys[e].down = !this.keys[e].down;
    });

    let frame: GameEventData['frame'] = {
      playerA: this.pa,
      playerB: this.pb,
      ball_xpos: this.ball_xpos,
      ball_ypos: this.ball_ypos,
      ball_angle_rad: this.ball_angle_rad,
    }

    const updater = () => {
      let userA: string = this.users.values().next().value;  // temp solution for 1-player game
      let keyUp: boolean = this.keys[userA].up;
      let keydown: boolean = this.keys[userA].down;
      console.log("key status: ", userA, keyUp, keydown);

      updateFrame(frame, keyUp, keydown);
      this.emit('frame', frame);
    }
    setInterval(() => updater(), GameCommon.FRAMERATE);
  }

  destroy(): void {
    super.destroy();
  }
}
