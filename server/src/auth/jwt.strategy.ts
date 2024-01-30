import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { FourTwoStrategy } from './fourtwo.strategy';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import * as speakeasy from 'speakeasy';
import { User } from 'src/user/user.entity';

const extractJwtFromCookie = (req: Request): string | null => {
  return req.cookies?.['accessToken'] || null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  jwtService: any;
  constructor(
    private configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractJwtFromCookie]),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any): Promise<User> {
    const user = await this.userService.findOne(payload.login);
    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.isTwoFAEnabled && !payload.isTwoFAVerified) {
      throw new UnauthorizedException('2FA is enabled but not verified');
    }

    return user;
  }
}
