import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import axios from 'axios';
import FortyTwoStrategy from 'passport-42';
import { PassportStrategy } from '@nestjs/passport';


function toHex(buffer: Buffer) {
    return buffer.toString('hex');
  }

@Injectable()
export class AuthService extends PassportStrategy(FortyTwoStrategy, '42') {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private userService: UserService,
  ) {
    super({
      clientID: configService.get('AUTH_ID'),
      clientSecret: configService.get('AUTH_SECRET'),
      callbackURL: `http://${configService.get('HOST')}:3000/auth/42/callback`,
    });
  }

  
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
        secret: this.configService.get('JWT_SECRET'),
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

  async validatePassword(login: string, password: string): Promise<boolean> {
    const user = await this.userService.findOne(login);
    if (!user) {
      return false;
    }

    // Make a request to 42 API to validate the password
    const response = await axios.post(
      `https://profile.intra.42.fr/otp_settings`,
      {
        users: { password },
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // Add necessary headers here
        },
      },
    );

    return response.status === 200;
  }

}