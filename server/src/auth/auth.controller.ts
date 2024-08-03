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

import {
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  Controller,
  UnauthorizedException,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/user.entity';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwt: JwtService,
    private userService: UserService,
    private config: ConfigService,
  ) {}

  @Get('42')
  @UseGuards(AuthGuard('42'))
  async signInWith42() {}

  async redir(host: string, token: string, login: string) {
    const user: User | null = await this.userService.findOne(login);
    if (user?.isTwoFAEnabled) {
      return `http://${this.config.get('HOST')}:5173/2fa-verify/${login}`;
    }
    else {
      return `http://${this.config.get('HOST')}:5173/?token=${token}&u=${login}`;
    }
  }

  @Get('check')
  @UseGuards(AuthGuard('jwt'))
  async checkAuth(@Req() req: any): Promise<User> {
    return req.user;
  }

  @Get('42/callback')
  @UseGuards(AuthGuard('42'))
  async fortyTwoAuthRedirect(@Req() req: Request & any, @Res() res: Response) {
    const { accessToken, user }: { accessToken: string; user: User } = req.user;

    const referer =
      req.headers.referer || `http://${this.config.get('HOST')}:5173`;
    const host = new URL(referer).hostname;

    res.redirect(await this.redir(host, accessToken, user.login));
  }

  private anonc = 0;

  @Get('anon')
  async anonSignIn(@Req() req: Request & any, @Res() res: Response) {
    const referer =
      req.headers.referer || `http://${this.config.get('HOST')}:5173`;
    const host = new URL(referer).hostname;
    const name = '$anon' + this.anonc++;
    let user: User | null;
    if (!(user = await this.userService.findOne(name)))
      user = await this.userService.create({ login: name, displayName: name });
    const accessToken = this.jwt.sign({ ...user });
    res.redirect(await this.redir(host, accessToken, name));
  }

  @Post(':login/:token/2fa/verify')
  async verifyTwoFA(
    @Req() req: Request & any,
    @Res() res: Response,
    @Param('login') login: string,
  ) {

    // do actual verification


    // if OK, return redirect string to client
    const user: User | null = await this.userService.findOne(login);
    const token = this.jwt.sign({ ...user });
    req.headers.referer = `http://${this.config.get('HOST')}:5173`;
    console.log('redirecting...');
    res.send(
      `http://${this.config.get('HOST')}:5173/?token=${token}&u=${login}`
    )
  }
}
