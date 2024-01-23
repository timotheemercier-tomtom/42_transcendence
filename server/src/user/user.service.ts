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

  //   createUser(userData: Partial<User>, userDto: UserDto): Promise<User> {
  //     const user: User = new User();
  //     user.username = userDto.username;
  //     user.password = createUserDto.password;
  //     user.gender = createUserDto.gender;
  //     return this.userRepository.save(user);
  //   }

  async create(userData: Partial<User>): Promise<User> {
    const newuser = this.usersRepository.create(userData);
    return await this.usersRepository.save(newuser);
  }

  async findOne(username: string): Promise<User | null> {
    return await this.usersRepository.findOneBy({ username });
  }
  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async update(username: string, updateUserDto: UserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.username) {
      user.username = updateUserDto.username;
    }
    if (updateUserDto.picture) {
      user.picture = updateUserDto.picture;
    }

    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }
  
  async delete(username: string): Promise<void> {
    await this.usersRepository.delete(username);
  }
}
