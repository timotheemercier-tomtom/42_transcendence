import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

enum SQLErrorCode {
  UniqueViolation = '23505',
}

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async validateUser(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.config.get('JWT_SECRET'),
      });
      const user = await this.userService.findOne(decoded.username);
      if (user) {
        return user;
      }
    } catch (error) {
        throw new UnauthorizedException('Error Login Invalid');
    }
  }


  

}
