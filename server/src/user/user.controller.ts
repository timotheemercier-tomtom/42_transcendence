/**
 * Creation de endpoints pour gérer les requêtes liées aux utilisateurs.
 */

import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * @Get(':username') crée un endpoint qui peut être utilisé pour
 * récupérer les informations d'un utilisateur basé sur son username.
 */

/** Pour obtenir les informations d'un utilisateur spécifique */
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // La méthode getUser appelle userService.findUserByUsername, dans user.service.ts.
  @Get(':username')
  async getUser(@Param('username') username: string): Promise<User | null> {
    return await this.userService.findUserByUsername(username);
  }

  /* @Patch(':username') définit un endpoint pour les requêtes de modification. 
  updateUserDto est un DTO (Data Transfer Object) que tu dois créer pour définir 
  les champs qui peuvent être mis à jour. */

  @Patch(':username')
  async updateUser(
    @Param('username') username: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.userService.updateUser(username, updateUserDto);
  }
}
