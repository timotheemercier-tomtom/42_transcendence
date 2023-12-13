import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport';
import { VerifyCallback } from 'passport-oauth2';
const FortyTwoStrategy = require('passport-42').Strategy;

@Injectable()
export class FortyTwoAuthStrategy extends PassportStrategy(
  FortyTwoStrategy,
  '42',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('AUTH_ID'),
      clientSecret: configService.get('AUTH_SECRET'),
      callbackURL: '/login/42/return',
      passReqToCallback: true,
      profileFields: {
        id: function (obj: any) {
          return String(obj.id);
        },
        username: 'login',
        displayName: 'displayname',
        'name.familyName': 'last_name',
        'name.givenName': 'first_name',
        profileUrl: 'url',
        'emails.0.value': 'email',
        'photos.0.value': 'image_url',
      },
    });
  }

  async validate(
    request: { session: { accessToken: string } },
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    cb: VerifyCallback,
  ): Promise<any> {
    request.session.accessToken = accessToken;
    console.log('accessToken', accessToken, 'refreshToken', refreshToken);
    return cb(null, profile);
  }
}
