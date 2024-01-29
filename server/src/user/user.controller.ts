/**
 * ? Controller('user')
 * The Controller decorator defines the route path for this controller
 *
 * ? Get(':username')
 * Handles GET requests for a specific user based on their username.
 * Uses JWT for authentication and authorization.
 * @param {string} username - The username of the user to retrieve.
 * @return {Promise<User | null>} - The user object or null if not found.
 *
 * ? Get()
 * Handles GET requests to retrieve the authenticated user's details.
 * Uses JWT for authentication.
 * @param {any} req - The request object containing user information.
 * @return {Promise<User | null>} - The authenticated user object or null if not found.
 *
 * ? Patch(':username')
 * Handles PATCH requests for updating a user's details based on their username.
 * Checks if the authenticated user matches the user being updated.
 * @param {string} username - The username of the user to update.
 * @param {UserDto} updateUserDto - The DTO containing the updated user data.
 * @param {Request & any} request - The request object containing user authentication details.
 * @return {Promise<User>} - The updated user object.
 */

import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserDto } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';
import { FriendService } from './friend.service';
import { Friend } from './friend.entity';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private friendService: FriendService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUser(@Req() req: any): Promise<User | null> {
    return await this.userService.findOne(req.user.login);
  }

  @Get(':login')
  @UseGuards(JwtAuthGuard)
  async findUser(
    @Req() request: Request & any,
    @Param('login') login: string,
  ): Promise<User | null> {
    const user = await this.userService.findOne(login);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Patch(':login')
  async updateUser(
    @Param('login') login: string,
    @Body() updateUserDto: UserDto,
    @Req() request: Request & any,
  ): Promise<User> {
    const user = request.user;
    if (user.login !== login) {
      throw new UnauthorizedException();
    }
    return await this.userService.update(login, updateUserDto);
  }

  @Post(':login/friend/:friend')
  async toggleFriend(
    @Param('login') login: string,
    @Param('friend') friendId: string,
  ): Promise<any> {
    if (await this.friendService.isFriend(login, friendId)) {
      this.friendService.removeFriend(login, friendId);
      return { message: 'Friend removed successfully' };
    } else {
      this.friendService.addFriend(login, friendId);
      return { message: 'Friend added successfully' };
    }
  }

  @Get(':login/friends')
  async listAllFriends(@Param('login') login: string): Promise<User[]> {
    return this.friendService.getFriends(login);
  }
}
