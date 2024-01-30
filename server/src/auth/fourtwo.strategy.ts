/**
 Handles authentication logic and integrates with external authentication providers.
 Interacts with the 42 API to authenticate users.

 *? Passport Strategy:
 Extends PassportStrategy with 'FortyTwoStrategy' from 'passport-42' for authenticating with 42.
 Configures the strategy with client ID, client secret, and callback URL.
 
 *? Dependencies:
  Relies on ConfigService to retrieve authentication-related environment variables.
  Utilizes UserService to manage user-related operations.
  Uses JwtService from '@nestjs/jwt' for JWT token creation and validation.
 
  *? Validation:
  Implements a 'validate' method to process user profile data after authentication.
  Validates and stores user information obtained from the external provider.
  Generates a JWT token for the authenticated user.
  Includes a TODO comment regarding token storage and checking for duplicates.
  
  *? Access Token: 
  the token we use to authenticate the current user by sending
  it on the Authorization header as a Bearer token. It has a small lifespan of
  5 to 15 minutes

  *? Refresh Token: 
  this token is normally sent on a signed HTTP
  only cookie and is used to refresh the access tokens, this is achieved since
  the refresh token has a higher lifespan from 20 minutes to 7 days.
 */

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
    const username = profile.username;
    let user = await this.userService.findOne(username);
    if (!user) {
      user = await this.userService.create({
        login: username,
        username,
        picture: profile._json.image.link,
      });
    }
    const payload = { login: user.login };
    accessToken = this.jwtService.sign(payload);
    return { user, accessToken };
  }
}
