// import { JwtService } from '@nestjs/jwt';
// import { UserService } from 'src/user/user.service';


// @Injectable()
// class AuthService {
//   constructor(private jwtService: JwtService, private userService: UserService,) {
//     this.userService = userService;
//     this.jwtService = jwtService;
//   }

//   async validateUser(payload: any) {

//     // const user = await this.userService.findBy(payload.sub);
//     const user = await this.userService.findOne(payload.login);
//     return user;
//   }

//   async generateJwtToken(user: any) {
//     // Generate a JWT token based on the user's data.
//     const payload = { sub: user.id, username: user.username };
//     return this.jwtService.sign(payload);
//   }
// }

// module.exports = AuthService;

import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';


@Injectable()
export class TwoFAService {
  generate2FAsecret(login: any) {
    const secret = speakeasy.generateSecret({
      name: `ByteScrum Custom App:${login}`,
    });
    return secret.base32;
  }

  generate2FAToken(secret: string) {
    return speakeasy.totp({
      secret,
      encoding: 'base32',
    });
  }

  validate2FaToken(token: string, secret: string) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });
  }
}
