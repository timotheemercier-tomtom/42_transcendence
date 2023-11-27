/**
 * Contains the logic for handling user data after authentication,
 * including communication with the 42 API.
 * Interacts with the 42 API to authenticate users.
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';

const FortyTwoStrategy = require('passport-42').Strategy;

@Injectable()
export class AuthService extends PassportStrategy(FortyTwoStrategy, '42') {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    super({
      clientID: configService.get('AUTH_ID'),
      clientSecret: configService.get('AUTH_SECRET'),
      callbackURL: 'http://localhost:3000/auth/42/callback',
      scope: ['public'],
    });
  }

  async validate(
    profile: any,
  ): Promise<any> {
    console.log(profile);

    const { username } = profile;
    const existingUser = await this.userService.findUserById(username);
    console.log(existingUser);

    if (!existingUser) {
      await this.userService.createUser({ username });
    }
    const payload = { username };
    accessToken: this.jwtService.sign(payload);
  }
}
