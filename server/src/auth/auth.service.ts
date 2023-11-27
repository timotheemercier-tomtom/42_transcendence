/**
 * Contains the logic for handling user data after authentication, 
 * including communication with the 42 API. 
 * Interacts with the 42 API to authenticate users.
 */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

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

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { id, username, photos } = profile;
    const existingUser = await this.userService.findUserById(id);
    if (!existingUser) {
        const newUser = await this.userService.createUser({ id, username, photos });
      return { user: newUser, photo: photos[0].value, isNew: true };
    }
    return {
      accessToken,
      refreshToken,
      user: {
        existingUser,
        isNew: false,
      },
    };
  }
}


// async validate(profile: any): Promise<any> {
//     // Extract necessary information from the profile
//     const { id, username, ... } = profile;
  
//     // Check if the user exists in your database
//     const existingUser = await this.userService.findUserById(id);
  
//     if (!existingUser) {
//       // If the user doesn't exist, create a new one
//       const newUser = await this.userService.createUser({ id, username, ... });
//       return { user: newUser, isNew: true };
//     }
  
//     // If the user exists, return the existing user
//     return { user: existingUser, isNew: false };
//   }
  
