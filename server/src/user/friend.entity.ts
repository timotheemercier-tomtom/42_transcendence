import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Friend {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  friendId: string;

  @ManyToOne(() => User, (user) => user.friends)
  @JoinColumn({ name: 'friendId', referencedColumnName: 'login' })
  friend: User;
}
