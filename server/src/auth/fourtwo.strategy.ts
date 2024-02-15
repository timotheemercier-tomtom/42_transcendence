/*
// 42-Strategy -> handles OAuth login with the 42 API
*/
// It uses our app's credentials to authenticate users at 42.
// When a user logs in, we check if they're already in our database.
// If not, we create a new user with their 42 profile info.
// We then generate a JWT for the user, allowing secure access to our app.

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import FortyTwoStrategy from 'passport-42';
import { UserService } from 'src/user/user.service';

@Injectable()
export class FourTwoStrategy extends PassportStrategy(FortyTwoStrategy, '42') {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    super({
      clientID: configService.get('AUTH_ID'),
      clientSecret: configService.get('AUTH_SECRET'),
      callbackURL: `http://${configService.get('HOST')}:3000/auth/42/callback`,
    });
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
        login: login,
        username: login,
        picture: profile._json.image.link,
      });
    }
    const payload = { login };
    accessToken = this.jwtService.sign(payload);
    return { user, accessToken };
  }
}
