/**
 * ? `UserService`
 * Provides business logic for user operations in the Transcendance project.
 *
 * ? `findUserByUsername`
 * Retrieves a user from the database by their username using TypeORM's findOne method.
 * @param {string} username - The username of the user to retrieve.
 * @return {Promise<User | null>} - The user object or null if not found.
 *
 * ? `createUser`
 * Creates a new user in the database using the provided user data.
 * @param {Partial<User>} userData - Partial user data for creating a new user.
 * @return {Promise<User>} - The newly created user object.
 *
 * ? `updateUser`
 * Updates an existing user's details in the database. It first finds the user by username,
 * then updates their details with the provided UpdateUserDto, and finally saves the updated user.
 * @param {string} username - The username of the user to update.
 * @param {UserDto} updateUserDto - The DTO containing the updated user data.
 * @return {Promise<User>} - The updated user object.
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDto } from './user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async updateWinLossScore(
    loginWon: string,
    loginLost: string,
  ): Promise<boolean> {
    const userWon = await this.usersRepository.findOneBy({
      login: loginWon,
    });
    console.log(`Game ended. Player '${loginWon}' won from '${loginLost}'`);
    if (!userWon) {
      throw new NotFoundException('User not found');
    }
    userWon.won += 1;
    this.usersRepository.save(userWon);

    const userLost = await this.usersRepository.findOneBy({
      login: loginLost,
    });
    if (!userLost) {
      throw new NotFoundException('User not found');
    }
    userLost.lost += 1;
    this.usersRepository.save(userLost);
    return true;
  }

  async updateImage(login: string, base64Image: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ login });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.picture = base64Image;
    return this.usersRepository.save(user);
  }

  async update(login: string, updateUserDto: UserDto): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { login },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return await this.usersRepository.save(user);
  }

  async findOne(login: string): Promise<User | null> {
    return await this.usersRepository.findOneBy({ login });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async removeOne(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
