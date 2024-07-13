import { WsException } from '@nestjs/websockets';
import {
  GameCommon,
  GameEventData,
  KeyState,
  GameState,
  GameType,
} from './GameCommon';
import { runPhysics } from './physics';
import { UserService } from 'src/user/user.service';
import { GameService } from './game.service';

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
    isSelfBalancing: boolean,
    private readonly userService: UserService,
    private readonly gameService: GameService,
  ) {
    super();
    this.gameId = gameId;
    this.isPublic = isPublic;
    this.isSelfBalancing = isSelfBalancing;
    console.log(`game room created: '${gameId}'`);
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
    if (userId != this.playerA && userId != this.playerB) {
      throw new WsException('user not in this game');
    }
    if (this.gameState == GameState.Running) {
      if (!this.playerA || !this.playerB) {
        throw new WsException(
          'invalid combination: game is running without 2 players',
        );
      }
      this.gameState = GameState.Finished;
      const winner: string =
        userId == this.playerA ? this.playerB : this.playerA;
      clearInterval(this.frameInterval);
      setTimeout(this.resetGame.bind(this), 5000);
      this.userService.updateWinLossScore(winner, userId);
      this.gameService.storeMatchHistory(this, winner);
      this.removePlayerFromGame(userId);
      this.emitGameState(`Player '${winner}' won, because '${userId}' left!!`);
    } else {
      if (this.gameState == GameState.ReadyToStart)
        this.gameState = GameState.WaitingForPlayers;
      this.removePlayerFromGame(userId);
      this.emitGameState();
    }
  }

  removePlayerFromGame(userId: string) {
    switch (userId) {
      case this.playerA: {
        this.playerA = undefined;
        break;
      }
      case this.playerB: {
        this.playerB = undefined;
        break;
      }
    }
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
      const winner: string = this.scoreA == 10 ? this.playerA! : this.playerB!;
      const loser: string = this.scoreA < 10 ? this.playerA! : this.playerB!;
      this.emitGameState(`Player '${winner}' Won!'`);
      setTimeout(this.resetGame.bind(this), 5000);
      this.userService.updateWinLossScore(winner, loser);
      this.gameService.storeMatchHistory(this, winner);
    }
    this.emit('frame', this.createFrame());
  }

  emitGameState(textMsg: string | undefined = undefined): void {
    this.emit('game_state', {
      gameState: this.gameState,
      playerA: this.playerA,
      playerB: this.playerB,
      spectators: Array.from(this.spectators),
      textMsg: textMsg,
      gameType: this.isSelfBalancing
        ? GameType.SelfBalancing
        : GameType.Classic,
      isPublic: this.isPublic,
      scoreA: this.scoreA,
      scoreB: this.scoreB,
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
      selfBalancingFactor: this.selfBalancingFactor,
    };
    return frame;
  }

  destroy(): void {
    console.log(`game room deleted: ${this.gameId}`);
    super.destroy();
  }

  resetGame() {
    this.playerA = undefined;
    this.playerB = undefined;
    this.pausingAfterGoal = false;
    this.scoreA = 0;
    this.scoreB = 0;
    this.pa = this.h / 2 - GameCommon.PH / 2;
    this.pb = this.h / 2 - GameCommon.PH / 2;
    this.ballAngle = 1.5 * Math.PI;
    this.ballXpos;
    this.ballYpos;
    this.gameState = GameState.WaitingForPlayers;
    this.emit('frame', this.createFrame());
    this.emitGameState();
  }
}
