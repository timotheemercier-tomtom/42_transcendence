import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  import { User } from '../user/user.entity';


@Entity()
export class TwoFA {
  @PrimaryGeneratedColumn()
  url: number;

  @Column()
  secret: string;

  @Column()
  friendId: string;

  @ManyToOne(() => User, (user) => user.twoFA)
  @JoinColumn({ name: 'secret', referencedColumnName: 'twoFA' })
  friend: User;
}
