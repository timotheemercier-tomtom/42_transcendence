import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Friend } from './friend.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  login: string;

  @Column({ length: 42, unique: true })
  displayName: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ default: 0 })
  won: number;

  @Column({ default: 0 })
  lost: number;

  @Column({ default: 0 })
  rank: number;

  @Column({ nullable: true })
  twoFASecret?: string;

  @Column({ default: false })
  isTwoFAEnabled: boolean;

  @OneToMany(() => Friend, (friend) => friend.friend)
  friends: Friend[];
}
