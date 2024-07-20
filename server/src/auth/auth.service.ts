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

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<{ user: any; accessToken: string }> {
    const login = profile.username;
    let user = await this.userService.findOne(login);
    if (!user) {
      user = await this.userService.create({
        login,
        displayName: login,
        picture: profile._json.image.link,
      });
    }

    const payload = { login: user.login, displayName: user.displayName };
    const localAccessToken = this.jwtService.sign(payload);
    return { user, accessToken: localAccessToken };
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
