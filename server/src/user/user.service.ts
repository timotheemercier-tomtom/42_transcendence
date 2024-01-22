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
 * @param {UpdateUserDto} updateUserDto - The DTO containing the updated user data.
 * @return {Promise<User>} - The updated user object.
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  async findUser(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async updateUser(
    username: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }
}
