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
  frameInterval!: NodeJS.Timeout;

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
    this.emitGameState();
  }

  leaveGameRoom(userId: string) {
    this.spectators.delete(userId);
    if (this.userA == userId || this.userB == userId) this.leave(userId);
    this.emitGameState();
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
    if (this.userA && this.userB) {
      this.gameState = GameState.ReadyToStart;
    }
    this.emitGameState();
  }

  leave(userId: string) {
    let winner: string | undefined;
    if (this.userA == userId) {
      this.userA = undefined;
      winner = this.userB;
    } else if (this.userB == userId) {
      this.userB = undefined;
      winner = this.userA;
    } else {
      throw new WsException('user not in this game');
    }
    if (this.gameState == GameState.ReadyToStart)
      this.gameState = GameState.WaitingForPlayers;
    else if (this.gameState == GameState.Running) {
      this.gameState = GameState.Finished;
      clearInterval(this.frameInterval);
      if (winner) this.userService.updateWinLossScore(winner, userId);
    }
    this.emitGameState();
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
    this.frameInterval = setInterval(
      () => this.gameRunner(),
      GameCommon.FRAMEDELAY,
    );
  }

  gameRunner(): void {
    runPhysics.bind(this)();
    if (this.scoreA == 10 || this.scoreB == 10) {
      clearInterval(this.frameInterval);
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

  emitGameState(): void {
    this.emit('game_state', {
      gameState: this.gameState,
      playerA: this.userA,
      playerB: this.userB,
      spectators: Array.from(this.spectators),
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
