import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Friend } from './friend.entity';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend) private friendRepository: Repository<Friend>,
    @InjectRepository(User) private userRepository: Repository<User>,
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
}
