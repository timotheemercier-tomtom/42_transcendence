// src/entity/twoFA.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class TwoFA {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  secret: string;

  @Column()
  otpAuthUrl: string;

  @OneToOne(() => User, (user) => user.twoFA)
  @JoinColumn()
  user: User;
}
