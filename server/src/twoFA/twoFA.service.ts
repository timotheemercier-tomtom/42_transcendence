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
import { authenticator } from 'otplib';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { toFileStream } from 'qrcode';
import { Response } from 'express';

@Injectable()
export class TwoFAService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  public async generateTwoFA(user: User) {
    // generate the unique key associated to the user for auth 2fa
    const secret = authenticator.generateSecret();
    const appName = this.configService.get('TWOFA_APPNAME');
    if (!appName) {
      throw new Error("Configuration error: 'TWOFA_APPNAME' is not defined");
    }

    // generates the URL requiered for the 2fa configuration
    const otpAuthUrl = authenticator.keyuri(user.login, appName, secret);

    await this.userService.setTwoFA(user.login, secret);

    return {
      secret,
      twoFA: secret,
      TwoFACode: otpAuthUrl,
    };
  }

  public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    return toFileStream(stream, otpauthUrl);
  }

  public isTwoFACodeValid(twoFACode: string, user: User) {
    const secret = user.twoFA;
    if (secret) {
      return authenticator.verify({
        token: twoFACode,
        secret,
      });
    }
    throw new Error('Error: user code and 2FA secret does not match');
  }
}
