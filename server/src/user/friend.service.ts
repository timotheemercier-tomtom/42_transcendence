import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Friend } from './friend.entity';
import { User } from './user.entity';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend) private friendRepository: Repository<Friend>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async addFriend(userId: string, friendId: string): Promise<Friend> {
    const friend = this.friendRepository.create({ userId, friendId });
    return this.friendRepository.save(friend);
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    await this.friendRepository.delete({ userId, friendId });
  }

  async getFriends(userId: string): Promise<User[]> {
    const friends = await this.friendRepository.find({
      where: { userId },
      relations: ['friend'],
    });

    return friends.map((friend) => friend.friend);
  }

  async isFriend(userId: string, friendId: string): Promise<boolean> {
    const friend = await this.friendRepository.findOne({
      where: { userId, friendId },
    });
    return !!friend;
  }

  async getUsersWhoAddedAsFriend(userLogin: string): Promise<User[]> {
    const friendRelationships = await this.friendRepository.find({
      where: { friendId: userLogin },
      relations: ['friend'],
    });

    const userIds = friendRelationships.map((friendship) => friendship.userId);

    const friends = await this.usersRepository.findBy({ login: In(userIds) });
    return friends;
  }
}
