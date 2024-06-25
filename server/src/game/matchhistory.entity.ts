import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { GameType } from './GameCommon';

@Entity()
export class MatchHistory {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column('timestamp')
  // timestamp: Date;

  @Column()
  winner: string;

  @Column()
  playerA: string;

  @Column()
  playerB: string;

  @Column()
  scoreA: number;

  @Column()
  scoreB: number;

  // @Column()
  // gameType: GameType;
}
