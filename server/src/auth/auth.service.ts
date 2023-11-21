import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
// import  Strategy  from 'passport-42';
// import { Strategy as FortyTwoStrategy } from 'passport-42';

const FortyTwoStrategy = require('passport-42').Strategy;

@Injectable()
export class AuthService extends PassportStrategy(FortyTwoStrategy, '42') {
  constructor() {
    super({
        clientID: process.env.AUTH_ID,
        clientSecret: process.env.AUTH_SECRET,
        callbackURL: 'http://localhost:3000/auth/42/callback',
        scope: ['public'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    const { username, photos } = profile;
    return {
      accessToken,
      refreshToken,
      user: {
        username,
        photo: photos[0].value,
      },
    };
  }
}
