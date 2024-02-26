import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async validateUser(token: string): Promise<any> {
    try {
      // Ensure this matches the secret used in JwtStrategy
      const decoded = this.jwtService.verify(token, {
        secret: this.config.get('JWT_SECRET'),
      });

      // 'decoded' contains the payload of the JWT. Use this to validate the user.
      const user = await this.userService.findOne(decoded.login);
      if (!user) {
        return null;
      }
      return user;
    } catch (error) {
      // Handle invalid token, expired token, etc.
      return null;
    }
  }
}
