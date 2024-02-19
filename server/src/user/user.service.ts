import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  /*
  //------------------------------------------------------------- CREATE
  */
  async create(userProfile: UserDto): Promise<User> {
    const newUser = await this.usersRepository.create(userProfile);
    await this.usersRepository.save(newUser);
    return newUser;
  }

  /*
  //------------------------------------------------------------- 2FA
  */
  async setTwoFA(login: string, secret: string | undefined) {
    return this.update(login, {
      twoFA: secret,
    });
  }

  /*
  //------------------------------------------------------------- SEARCH 
  */

  async findOne(login: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ login });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this username does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async findById(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  /*
  //------------------------------------------------------------- UPDATE 
  */
  async update(login: string, updateUserDto: UserDto): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { login: login },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async updateImage(login: string, base64Image: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ login });
    if (user) {
      user.picture = base64Image;
      return this.usersRepository.save(user);
    }
    throw new HttpException(
      'User with this login does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  /*
  //------------------------------------------------------------- DELETE 
  */
  async removeOne(login: string): Promise<void> {
    await this.usersRepository.delete(login);
  }
}
