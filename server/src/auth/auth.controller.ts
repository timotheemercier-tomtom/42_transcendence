/**

controller handles request in NestJS. This file contains the AuthController for
a NestJS application. Handles HTTP requests related to user authentication.

*? Controller Setup: 
    The controller is marked with the '@Controller' decorator,
    defining it as a NestJS controller with a base route. The AuthService is
    injected into the controller to handle authentication logic.

*? Routes:
@Get('42') Route for initiating the 42 OAuth authentication process.
    @Get('42/callback') Callback route for 42 OAuth authentication, handling the
user data after successful authentication and setting an HTTP-only cookie with
    the access token.

*? Authentication Guard: 
    Utilizes NestJS's '@UseGuards' with an 'AuthGuard' to
    protect the routes and manage the authentication flow.
 */

import { Get, Req, Res, UseGuards, Controller } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FourTwoStrategy } from './fourtwo.strategy';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: FourTwoStrategy,
    private jwt: JwtService,
    private user: UserService,
    private config: ConfigService,
  ) {}

  @Get('42')
  @UseGuards(AuthGuard('42'))
  async signInWith42() {}

  redir(host: string, token: string, username: string) {
    return `http://${this.config.get(
      'HOST',
    )}:5173/login?token=${token}&u=${username}`;
  }

  @Get('42/callback')
  @UseGuards(AuthGuard('42'))
  async fortyTwoAuthRedirect(@Req() req: Request | any, @Res() res: Response) {
    const { accessToken, user } = req.user;
    // accessToken est directement extraits de req.user.
    const host = new URL(req.headers.referer).hostname;
    res.redirect(this.redir(host, accessToken, user.username));
  }

  anonc = 0;

  @Get('anon')
  async anonSignIn(@Req() req: Request | any, @Res() res: Response) {
    const host = new URL(req.headers.referer).hostname;
    const name = '$anon' + this.anonc++;
    if (!(await this.user.findOne(name)))
      await this.user.create({ login: name, username: name });
    const t = this.jwt.sign({ login: name });
    res.redirect(this.redir(host, t, name));
  }
}
