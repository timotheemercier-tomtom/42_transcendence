import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Request } from 'express'; // Assuming Express is used
import { UserService } from 'src/user/user.service';

const extractJwtFromCookie = (req: Request): string | null => {
  return req.cookies?.['accessToken'] || null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  jwtService: any;
  constructor(
    private configService: ConfigService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractJwtFromCookie]),
      secretOrKey: configService.get('JWT_SECRET'),
      signOptions: { expiresIn: '60m' },
      
    });
  }

    async validate(payload: any) {
        
      return { username: payload.username };
    }
}

//   async validate(
//     profile: any,
//     payload: any,
//   ): Promise<{ user: any}> {
//     // const username = profile.username;
//     // let user = this.jwtService.sign(payload.username);
//     console.log(profile);

//     return { user };
//   }
