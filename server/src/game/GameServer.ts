import { WsException } from '@nestjs/websockets';
import {
  GameCommon,
  GameOpt,
  GameEventData,
  KeyState,
  GameState,
} from './GameCommon';
import { runPhysics } from './physics';
import { UserService } from 'src/user/user.service';

type keyStatus = { up: boolean; down: boolean };

export default class GameServer extends GameCommon {
  keysA: keyStatus = { up: false, down: false };
  keysB: keyStatus = { up: false, down: false };
  pausingAfterGoal: boolean = false;
  goalTimeStamp: number = 0;
  spectators: Set<string> = new Set<string>();

  constructor(
    gameId: string,
    isPublic: boolean,
    private readonly userService: UserService,
  ) {
    super();
    this.gameId = gameId;
    this.isPublic = isPublic;
  }

  addOpt(opt: GameOpt): void {
    super.addOpt(opt);
    this.emit('opt', this.opt);
  }

  joinGameRoom(userId: string) {
    this.spectators.add(userId);
    this.emit('join_game_room', { userId: userId, gameId: this.gameId });
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
    if (this.userA && this.userB) {
      this.gameState = GameState.ReadyToStart;
    }
    this.emitGameState();
  }

  leave(userId: string) {
    if (this.userA == userId) {
      this.userA = undefined;
    } else if (this.userB == userId) {
      this.userB = undefined;
    } else {
      throw new WsException('user not in this game');
    }
    if (this.gameState == GameState.ReadyToStart)
      this.gameState = GameState.WaitingForPlayers;
    else if (this.gameState == GameState.Running)
      this.gameState = GameState.Finished;
    this.emitGameState();
    this.emit('leave', { userId: userId, gameId: this.gameId });
  }

  start(gameId: string) {
    console.log("starting game '" + gameId + "'");

    this.on('key_change', (key_change: GameEventData['key_change']) => {
      let userKeys!: keyStatus;
      if (key_change.userId == this.userA) userKeys = this.keysA;
      if (key_change.userId == this.userB) userKeys = this.keysB;
      if (key_change.key == 'w' && key_change.keyState == KeyState.Pressed) {
        userKeys.up = true;
        userKeys.down = false;
      }
      if (key_change.key == 's' && key_change.keyState == KeyState.Pressed) {
        userKeys.up = false;
        userKeys.down = true;
      }
      if (key_change.key == 'w' && key_change.keyState == KeyState.Released) {
        userKeys.up = false;
      }
      if (key_change.key == 's' && key_change.keyState == KeyState.Released) {
        userKeys.down = false;
      }
    });

    this.gameState = GameState.Running;
    this.emitGameState();

    const gameRunner = () => {
      runPhysics.bind(this)();
      if (this.scoreA == 10 || this.scoreB == 10) {
        clearInterval(frameInterval);
        this.gameState = GameState.Finished;
        this.emitGameState();
        if (this.scoreA > this.scoreB) {
          this.userService.updateWinLossScore(this.userA!, this.userB!);
        } else {
          this.userService.updateWinLossScore(this.userB!, this.userA!);
        }
      }
      this.emit('frame', this.createFrame());
    };
    const frameInterval: NodeJS.Timeout = setInterval(
      () => gameRunner(),
      GameCommon.FRAMEDELAY,
    );
  }

  emitGameState(): void {
    this.emit('game_state', {
      gameState: this.gameState,
      playerA: this.userA,
      playerB: this.userB,
    });
  }

  createFrame(): GameEventData['frame'] {
    const frame: GameEventData['frame'] = {
      playerA: this.pa,
      playerB: this.pb,
      ballXpos: this.ballXpos,
      ballYpos: this.ballYpos,
      ballAngle: this.ballAngle,
      scoreA: this.scoreA,
      scoreB: this.scoreB,
    };
    return frame;
  }

  destroy(): void {
    super.destroy();
  }
}
