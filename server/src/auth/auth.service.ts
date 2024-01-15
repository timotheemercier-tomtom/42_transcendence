import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private jwtService: JwtService,
    private userService: UserService, // Use this if you need to fetch more user details
  ) {}

  async validateUser(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.config.get('JWT_SECRET'), // Ensure this matches the secret used in JwtStrategy
      });

      // 'decoded' contains the payload of the JWT. Use this to validate the user.
      const user = await this.userService.findUser(decoded.username); // Adjust based on your user properties
      if (!user) {
        return null;
      }

      return user; // Or return a subset of the user's information, as needed
    } catch (error) {
      // Handle invalid token, expired token, etc.
      return null;
    }
  }
}
