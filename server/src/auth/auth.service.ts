import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

import * as speakeasy from 'speakeasy';

function toHex(str: string) {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += str.charCodeAt(i).toString(16);
  }
  return result;
}

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  generateTwoFASecret(login: string): { otpauthUrl?: string; base32: string } {
    const secret = speakeasy.generateSecret({
      name: `Pong (${login})`,
    });

    const otpauthUrl = secret.otpauth_url;
    const base32 = secret.base32;

    return { otpauthUrl, base32 };
  }

  validateTwoFAToken(
    twoFA_secret_base32: string,
    verificationCode: string,
  ): boolean {
    const base32 = require('hi-base32');
    const secretAscii = base32.decode(twoFA_secret_base32);
    const secretHex = toHex(secretAscii);

    return speakeasy.totp.verify({
      secret: secretHex,
      encoding: 'hex',
      token: verificationCode,
      window: 6,
    });
  }

  async validateUser(token: string): Promise<User | null> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.config.get('JWT_SECRET'),
      });

      const user = await this.userService.findOne(decoded.login);
      if (!user) {
        return null;
      }
      return user;
    } catch (error) {
      return null;
    }
  }
}
