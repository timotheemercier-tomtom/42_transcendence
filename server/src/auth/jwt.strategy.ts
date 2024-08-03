import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { Auth } from 'typeorm';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
      private configService: ConfigService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractJwtFromCookie]),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: User, req: any) {
    const user = await this.userService.findOne(payload.login);
    if (!user) {
      throw new UnauthorizedException();
    }
    return payload;;
  }
}

const extractJwtFromCookie = (req: Request): string | null => {
  return req.cookies?.['accessToken'] || null;
};



// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   jwtService: any;
//   constructor(
//     private configService: ConfigService,
//     private readonly authService: FourTwoStrategy,
//     private readonly userService: UserService,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromExtractors([extractJwtFromCookie]),
//       secretOrKey: configService.get('JWT_SECRET'),
//     });
//   }

//   async validate(payload: User, req: any) {
//     return payload;
//   }
// }
