/**
 * Creation de endpoints pour gérer les requêtes liées aux utilisateurs.
 */

import {
  Body,  
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';  
import { UserService } from './user.service';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Get(':username') crée un endpoint afin de récupérer les
  // informations d'un utilisateur basé sur son username.
  @Get(':username')
  @UseGuards(JwtAuthGuard)
  async findUser(@Param('username') username: string): Promise<User | null> {
    return await this.userService.findUserByUsername(username);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUser(@Req() req: any): Promise<User | null> {
    return await this.userService.findUserByUsername(req.user.username);
  }

  // @Patch(':username') définit un endpoint pour les requêtes de modification.
  // updateUserDto est un DTO (Data Transfer Object) que tu dois créer pour
  // définir les champs qui peuvent être mis à jour.
  @Patch(':username')
  async updateUser(
    @Param('username') username: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: Request & any,
  ): Promise<User> {

    // Ensure the authenticated user is the one making the request
    // This involves checking the authenticated user's username against the `username` parameter
    // For example, if using JWT:
    const user = request.user;
    if (user.username !== username) {
      throw new UnauthorizedException();
    }

    return await this.userService.updateUser(username, updateUserDto);
  }
}
