import {
  Body,
  Controller,
  Get,
  HttpException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserDto } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUser(@Req() req: any): Promise<User | null> {
    return await this.userService.findOne(req.user.login);
  }

  @Get(':login')
  @UseGuards(JwtAuthGuard)
  async findUser(
    @Req() req: Request & any,
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
    @Req() req: Request & any,
  ): Promise<User> {
    const user = req.user;
    if (user.login !== login) {
      throw new UnauthorizedException();
    }
    return await this.userService.update(login, updateUserDto);
  }

  @Patch(':login/image')
  async updateImage(
    @Param('login') login: string,
    @Body() body: { picture: string },
  ): Promise<User> {
    return this.userService.updateImage(login, body.picture);
  }
}
