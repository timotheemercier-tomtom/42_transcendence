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
 * @param {UpdateUserDto} updateUserDto - The DTO containing the updated user data.
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
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UpdateUserDto } from './update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

//   @Get(':username')
//   @UseGuards(JwtAuthGuard)
//   async findUser(@Param('username') username: string): Promise<User | null> {
//     return await this.userService.findUser(username);
//   }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUser(@Req() req: any): Promise<User | null> {
    return await this.userService.findUser(req.user.username);
  }

  @Get(':username')
  @UseGuards(JwtAuthGuard)
  async findUser(@Req() req: any): Promise<User | null> {
    const user = await this.userService.findUser(req.user.username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Patch(':username')
  async updateUser(
    @Param('username') username: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: Request & any,
  ): Promise<User> {
    const user = request.user;
    if (user.username !== username) {
      throw new UnauthorizedException();
    }
    return await this.userService.updateUser(username, updateUserDto);
  }
}
