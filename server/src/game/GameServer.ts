import { WsException } from '@nestjs/websockets';
import { GameCommon, GameOpt, GameEventData, keyState } from './GameCommon';
import { updateFrame } from './physics';

type keyStatus = { up: boolean; down: boolean };

export default class GameServer extends GameCommon {
  keysA: keyStatus = { up: false, down: false };
  keysB: keyStatus = { up: false, down: false };
  scoreA: number = 0;
  scoreB: number = 0;
  pausingAfterGoal: boolean = false;
  goalTimeStamp: number = 0;

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
      this.keysA = { up: false, down: false };
    } else if (!this.userB) {
      this.userB = userId;
      this.keysB = { up: false, down: false };
    }
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

    // listen to key-change messages
    this.on('key_change', (key_change: GameEventData['key_change']) => {
      let userKeys!: keyStatus;
      if (key_change.userId == this.userA) userKeys = this.keysA;
      if (key_change.userId == this.userB) userKeys = this.keysB;
      if (key_change.key == 'w' && key_change.keyState == keyState.Pressed) {
        userKeys.up = true;
        userKeys.down = false;
      }
      if (key_change.key == 's' && key_change.keyState == keyState.Pressed) {
        userKeys.up = false;
        userKeys.down = true;
      }
      if (key_change.key == 'w' && key_change.keyState == keyState.Released) {
        userKeys.up = false;
      }
      if (key_change.key == 's' && key_change.keyState == keyState.Released) {
        userKeys.down = false;
      }
    });

    let frame: GameEventData['frame'] = {
      playerA: this.pa,
      playerB: this.pb,
      ball_xpos: this.ball_xpos,
      ball_ypos: this.ball_ypos,
      ball_angle_rad: this.ball_angle_rad,
      scoreA: this.scoreA,
      scoreB: this.scoreB,
    };

    const updater = () => {
      updateFrame.bind(this)(frame, this.keysA, this.keysB);
      this.emit('frame', frame);
    };
    setInterval(() => updater(), GameCommon.FRAMEDELAY);
  }

  destroy(): void {
    super.destroy();
  }
}
