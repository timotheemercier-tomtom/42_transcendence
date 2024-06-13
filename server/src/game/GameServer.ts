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
    console.log(`game created: '${gameId}'`);
  }

  addOpt(opt: GameOpt): void {
    super.addOpt(opt);
    // this.emit('opt', this.opt);
  }

  joinGameRoom(userId: string) {
    this.spectators.add(userId);
    console.log(`'${userId}' joined game room: '${this.gameId}'`);
    this.emit('join_game_room', { userId: userId, gameId: this.gameId });
    this.emitGameState();
  }

  leaveGameRoom(userId: string) {
    console.log(`'${userId}' left game room: '${this.gameId}'`);
    this.spectators.delete(userId);
    if (this.playerA == userId || this.playerB == userId) this.leave(userId);
    else this.emitGameState();
  }

  join(userId: string) {
    if (this.playerA == userId || this.playerB == userId)
      throw new WsException('user already in this game');
    if (this.playerA && this.playerB) throw new WsException('game is full');
    if (!this.playerA) {
      this.playerA = userId;
      this.keysA = { up: false, down: false };
    } else if (!this.playerB) {
      this.playerB = userId;
      this.keysB = { up: false, down: false };
    }
    if (this.playerA && this.playerB) {
      this.gameState = GameState.ReadyToStart;
    }
    this.emitGameState();
  }

  leave(userId: string) {
    let winner: string | undefined;
    if (this.playerA == userId) {
      this.playerA = undefined;
      winner = this.playerB;
    } else if (this.playerB == userId) {
      this.playerB = undefined;
      winner = this.playerA;
    } else {
      throw new WsException('user not in this game');
    }
    if (this.gameState == GameState.ReadyToStart)
      this.gameState = GameState.WaitingForPlayers;
    else if (this.gameState == GameState.Running) {
      this.gameState = GameState.Finished;
      clearInterval(this.frameInterval);
      if (winner) {
        this.userService.updateWinLossScore(winner, userId);
        this.emitGameState(`Player '${winner}' won, because '${userId}' left!!`);
        return;
      }
    }
    this.emitGameState();
  }

  start() {
    console.log(`game '${this.gameId}' starts!'`);
    this.on('key_change', (key_change: GameEventData['key_change']) => {
      if (this.gameState == GameState.Running) {
        let userKeys!: keyStatus;
        if (key_change.userId == this.playerA) userKeys = this.keysA;
        if (key_change.userId == this.playerB) userKeys = this.keysB;
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
      console.log(`game '${this.gameId}' finished!'`);
      clearInterval(this.frameInterval);
      this.gameState = GameState.Finished;
      if (this.scoreA > this.scoreB) {
        this.emitGameState(`Player '${this.playerA}' Won!'`);
        this.userService.updateWinLossScore(this.playerA!, this.playerB!);
      } else {
        this.userService.updateWinLossScore(this.playerB!, this.playerA!);
        this.emitGameState(`Player '${this.playerB}' Won!'`);
      }
    }
    this.emit('frame', this.createFrame());
  };

  emitGameState(textMsg: string | undefined = undefined): void {
    this.emit('game_state', {
      gameState: this.gameState,
      playerA: this.playerA,
      playerB: this.playerB,
      spectators: Array.from(this.spectators),
      textMsg: textMsg
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
