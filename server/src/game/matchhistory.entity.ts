import {
  CreateDateColumn,
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GameType } from './GameCommon';

@Entity()
export class MatchHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;

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

  @Column()
  gameType: GameType;
}
