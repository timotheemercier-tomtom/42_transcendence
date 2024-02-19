import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

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

  async validate(payload: any, req: any) {
    return { login: payload.login };
  }
}
//   async validate(payload: any): Promise<User> {
//     const user = await this.userService.findOne(payload.login);
//     if (!user) {
//       throw new UnauthorizedException();
//     }

// if (user.isTwoFAEnabled && !payload.isTwoFAVerified) {
//   throw new UnauthorizedException('2FA is enabled but not verified');
// }

// return user;
