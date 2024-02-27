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
import * as QRCode from 'qrcode';
import * as speakeasy from 'speakeasy';

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
  //------------------------------------------------------------- SEARCH 
  */

  async findOneWithTwoFA(login: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { login: login },
      relations: ['twoFA'], // This ensures the twoFA relationship is loaded
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findOne(login: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ login });
    if (!user) throw new NotFoundException();
    return user;
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

  async update(
    login: string,
    updateUserDto: UserDto,
    username?: string,
    base64Image?: string,
  ): Promise<User> {
    const user = await this.usersRepository.findOneBy({ login });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update image if provided
    if (base64Image) {
      user.picture = base64Image;
    }

    if (username) user.username = username;

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  /*
  //------------------------------------------------------------- 2FA 
  */
  // method to generate a 2FA secret for a user. This method generates a secret
  // and a QR code URL.
  async generateTwoFASecret(user: User) {
    const secret = speakeasy.generateSecret({ length: 20 });
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: encodeURIComponent(`@Pong42:${user.login}`),
      issuer: '@Pong42',
    });

    return { secret, otpauthUrl };
  }

  // method to generate a QR code image URL from the otpauthUrl.
  async getQRCodeDataURL(otpauthUrl: string): Promise<string> {
    return QRCode.toDataURL(otpauthUrl);
  }


  /*
  //------------------------------------------------------------- DELETE 
  */
  async removeOne(login: string): Promise<void> {
    await this.usersRepository.delete(login);
  }
}



  //   async update2(login: string, updateUserDto: UserDto): Promise<User> {
  //     const user = await this.usersRepository.findOne({
  //       where: { login: login },
  //     });
  //     if (!user) {
  //       throw new NotFoundException('User not found');
  //     }
  //     Object.assign(user, updateUserDto);
  //     return await this.usersRepository.save(user);
  //   }

  //   async updateImage(login: string, base64Image: string): Promise<User> {
  //     const user = await this.usersRepository.findOneBy({ login });
  //     if (user) {
  //       user.picture = base64Image;
  //       return this.usersRepository.save(user);
  //     }
  //     throw new HttpException(
  //       'User with this login does not exist',
  //       HttpStatus.NOT_FOUND,
  //     );
  //   }