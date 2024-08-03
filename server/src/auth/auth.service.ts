import * as base32 from 'hi-base32';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import FortyTwoStrategy from 'passport-42';
import { PassportStrategy } from '@nestjs/passport';

function toHex(buffer: Buffer) {
    return buffer.toString('hex');
}


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

  validateTwoFAToken(
    twoFA_secret_base32: string,
    verificationCode: string,
  ): boolean {
    const secretAscii = base32.decode.asBytes(twoFA_secret_base32);
    const secretBuffer = Buffer.from(secretAscii);
    const secretHex = toHex(secretBuffer);

    return speakeasy.totp.verify({
      secret: secretHex,
      encoding: 'hex',
      token: verificationCode,
      window: 6,
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
}

