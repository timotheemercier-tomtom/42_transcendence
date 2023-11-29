import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /** Cette méthode utilise la méthode findOne de TypeORM pour récupérer 
    un utilisateur de la base de données en fonction de son username. */

  async findUserByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  /**
   * Cette méthode recherche d'abord l'utilisateur dans la base de données, 
   * puis utilise Object.assign pour mettre à jour les champs de l'utilisateur a
   * vec les valeurs du updateUserDto. Enfin, elle enregistre l'utilisateur 
   * mis à jour dans la base de données.
   */
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
