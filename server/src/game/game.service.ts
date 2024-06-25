import { Injectable } from '@nestjs/common';
import GameServer from './GameServer';
import {
  Eventer,
  GameEventData,
  GameEventType,
  GameOpt,
  GameState,
  GameType,
} from './GameCommon';
import { randomUUID } from 'crypto';
import { WsException } from '@nestjs/websockets';
import { UserService } from 'src/user/user.service';
import { MatchHistory } from './matchhistory.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class GameService extends Eventer {
  constructor(
    @InjectRepository(MatchHistory)
    private matchHistoryRepository: Repository<MatchHistory>,
    private readonly userService: UserService,
  ) {
    super();
  }

  games = new Map<string, GameServer>();
  userToGame = new Map<string, string>();

  guardGame(id: string): GameServer {
    if (!this.games.has(id)) throw new WsException('game does not exist');
    return this.games.get(id)!;
  }

  guardUserInGameRoom(user: string): GameServer {
    const gameid = this.userToGame.get(user);
    if (gameid) return this.guardGame(gameid);
    throw new WsException('user not in any game room');
  }

  createAndJoin(createMsg: GameEventData['create']) {
    if (this.games.has(createMsg.gameId))
      throw new WsException('game already exists');
    const isSelfBalancing: boolean =
      createMsg.gameType == GameType.SelfBalancing ? true : false;
    const game = new GameServer(
      createMsg.gameId,
      createMsg.isPublic,
      isSelfBalancing,
      this.userService,
      this,
    );
    game.create(GameServer.W, GameServer.H);
    this.games.set(createMsg.gameId, game);
    this.userToGame.set(createMsg.userId, createMsg.gameId);
    this.emit('create', createMsg); // adds listeners in gateway
    game.joinGameRoom(createMsg.userId);
    game.join(createMsg.userId);
  }

  start(gameId: string) {
    const game = this.guardGame(gameId);
    game.start();
  }

  destroy(id: string) {
    const game = this.guardGame(id);
    game.destroy();
  }

  joinGameRoom(gameId: string, user: string) {
    const game = this.guardGame(gameId);
    const currentGameRoom: string | undefined = this.userToGame.get(user);
    if (currentGameRoom == undefined) {
      this.userToGame.set(user, gameId);
      game.joinGameRoom(user);
    } else if (currentGameRoom != gameId) {
      throw new WsException(`user already in a game`);
    }
    // console.log("games: ", this.games);
    // console.log("userToGame: ", this.userToGame);
  }

  leaveGameRoom(leftGameId: string, userId: string) {
    const game = this.guardGame(leftGameId);
    if (this.userToGame.get(userId) != leftGameId)
      throw new WsException('user already left the game');
    game.leaveGameRoom(userId);
    this.userToGame.delete(userId);
    if (game.spectators.size == 0) {
      this.games.delete(leftGameId);
      console.log(`game '${leftGameId}' removed from server'`);
    }
  }

  join(id: string, user: string) {
    const game = this.guardGame(id);
    if (!this.userToGame.get(user))
      throw new WsException('user is not yet in the game room');
    game.join(user);
  }

  leave(id: string, user: string) {
    const game = this.guardGame(id);
    game.leave(user);
  }

  key_change(userId: string, key_change: GameEventData['key_change']) {
    const game = this.guardUserInGameRoom(userId);
    game.emit('key_change', key_change, false);
  }

  passGameEvent<E extends GameEventType>(
    user: string,
    e: E,
    v: GameEventData[E],
  ) {
    const game = this.guardUserInGameRoom(user);
    game.emit(e, v);
  }

  enque(user: string, gameType: GameType) {
    if (this.userToGame.has(user))
      throw new WsException('user already in a game');
    // join existing public game
    const isSelfBalancing: boolean =
      gameType == GameType.SelfBalancing ? true : false;
    for (const [gameId, game] of this.games.entries()) {
      if (
        game.isPublic &&
        game.isSelfBalancing == isSelfBalancing &&
        game.gameState == GameState.WaitingForPlayers &&
        (!game.playerA || !game.playerB)
      ) {
        this.joinGameRoom(gameId, user);
        this.join(gameId, user);
        return;
      }
    }
    // create new public game
    const id = 'game-' + randomUUID();
    this.createAndJoin({
      gameId: id,
      userId: user,
      isPublic: true,
      gameType: gameType,
    });
  }

  opt(opt: GameOpt) {
    const game = this.guardGame(opt.gameId);
    game.addOpt(opt);
  }

  findAllMatchHistory(): Promise<MatchHistory[]> {
    return this.matchHistoryRepository.find();
  }

  async printAllMatchHistory() {
    let allMatches: MatchHistory[] = await this.findAllMatchHistory();
    console.log('allMatches: ', allMatches);
  }

  async storeMatchHistory(
    game: GameServer,
    winner: string,
  ): Promise<MatchHistory> {
    const rec: MatchHistory = this.matchHistoryRepository.create({
      winner: winner,
      playerA: game.playerA,
      playerB: game.playerB,
      scoreA: game.scoreA,
      scoreB: game.scoreB,
    });
    console.log('created match history record: ', rec);
    this.printAllMatchHistory(); // debug
    return this.matchHistoryRepository.save(rec);
  }
}
