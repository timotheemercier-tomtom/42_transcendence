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
  Req,
  Res,
  UseGuards,
  Controller,
  HttpStatus,
  Post,
  UnauthorizedException,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FourTwoStrategy, ValidateResult } from './fourtwo.strategy';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import * as speakeasy from 'speakeasy';
import { log } from 'console';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  @Get('42')
  @UseGuards(AuthGuard('42'))
  async signInWith42() {}

  redir(token: string, login: string) {
    return `http://${this.configService.get(
      'HOST',
    )}:5173/login?token=${token}&u=${login}`;
  }

  redirTwoFA(token: string, login: string) {
    return `http://${this.configService.get(
      'HOST',
    )}:5173/verify-2fa?token=${token}&u=${login}`;
  }

  @Get('42/callback')
  @UseGuards(AuthGuard('42'))
  async fortyTwoAuthRedirect(@Req() req: Request | any, @Res() res: Response) {
    const { accessToken, user } = req.user as ValidateResult;
    if (user.twoFAsecret) {
      return res.redirect(this.redirTwoFA(accessToken, user.login));
    } else res.redirect(this.redir(accessToken, user.login));
  }

  anonc = 0;

  @Get('anon')
  async anonSignIn(@Req() req: Request | any, @Res() res: Response) {
    const host = new URL(req.headers.referer).hostname;
    const name = '$anon' + this.anonc++;
    if (!(await this.userService.findOne(name)))
      await this.userService.create({ login: name, username: name });
    const t = this.jwtService.sign({ login: name });
    res.redirect(this.redir(t, name));
  }
}
