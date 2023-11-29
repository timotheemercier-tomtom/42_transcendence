/**
 * Handles authentication logic and integrates with external authentication providers.
 * Interacts with the 42 API to authenticate users.
 *
 *? Passport Strategy:
 * Extends PassportStrategy with 'FortyTwoStrategy' from 'passport-42' for authenticating with 42.
 * Configures the strategy with client ID, client secret, and callback URL.
 *
 *? Dependencies:
 * Relies on ConfigService to retrieve authentication-related environment variables.
 * Utilizes UserService to manage user-related operations.
 * Uses JwtService from '@nestjs/jwt' for JWT token creation and validation.
 *
 *? Validation:
 * Implements a 'validate' method to process user profile data after authentication.
 * Validates and stores user information obtained from the external provider.
 * Generates a JWT token for the authenticated user.
 * Includes a TODO comment regarding token storage and checking for duplicates.
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

  async validate(profile: any): Promise<any> {
    console.log(profile);
    const { username } = profile;

    let user = await this.userService.findUserByUsername(username);

    if (!user) {
      user = await this.userService.createUser({ username });
    }

    const payload = { username };

    /**
     **TODO: 
     store the JTW token in database, and check 
     if it already exist before to process sign in.
     **/

    const accessToken = this.jwtService.sign(payload);
    return { user, accessToken };
  }
}
