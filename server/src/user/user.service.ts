import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDto } from './user.dto';
import { User } from './user.entity';
// user.service.ts

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  async updateImage(login: string, base64Image: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ login });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.picture = base64Image;
    return this.userRepository.save(user);
  }

  async update(login: string, updateUserDto: UserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { login },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async findOne(login: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ login });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async removeOne(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async enableTwoFA(login: string, secret: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ login });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.twoFASecret = secret;
    user.isTwoFAEnabled = true;
    return this.userRepository.save(user);
  }

  async disableTwoFA(login: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ login });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.twoFASecret = '';
    user.isTwoFAEnabled = false;
    return this.userRepository.save(user);
  }

  async updateWinLossScore(
    loginWon: string,
    loginLost: string,
  ): Promise<boolean> {
    const userWon = await this.userRepository.findOneBy({
      login: loginWon,
    });
    if (!userWon) {
      throw new NotFoundException('User not found');
    }
    userWon.won += 1;
    this.userRepository.save(userWon);

    const userLost = await this.userRepository.findOneBy({
      login: loginLost,
    });
    if (!userLost) {
      throw new NotFoundException('User not found');
    }
    userLost.lost += 1;
    this.userRepository.save(userLost);
    return true;
  }
}
