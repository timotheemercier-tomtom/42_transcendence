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
import { FourTwoStrategy } from './fourtwo.strategy';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import * as speakeasy from 'speakeasy';

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

  redir(token: string, username: string) {
    return `http://${this.config.get(
      'HOST',
    )}:5173/login?token=${token}&u=${username}`;
  }

  @Get('42/callback')
  @UseGuards(AuthGuard('42'))
  async fortyTwoAuthRedirect(@Req() req: Request | any, @Res() res: Response) {
    const { token, user } = req.user;
    if (user.secret) {
      // Check if 2FA is enabled
      // Redirect to a 2FA verification page, passing along necessary information

      const twoFARedirectUrl = `http://${this.config.get('HOST')}:5173/verify2fa?token=${token}&u=${user.login}`;
      return res.redirect(twoFARedirectUrl);
    } else res.redirect(this.redir(token, user.login));
    // Proceed with the usual redirection if 2FA is not enabled
  }

  @Post('verify-2fa')
  async verifyTwoFA(
    @Body() body: { username: string; token: string },
  ): Promise<{ access: boolean; token?: string }> {
    const { username, token } = body;
    const user = await this.user.findOne(username);

    if (!user || !user.secret) {
      throw new UnauthorizedException('2FA not setup or user not found.');
    }

    const verified = speakeasy.totp.verify({
      secret: user.secret,
      encoding: 'base32',
      token,
    });

    if (verified) {
      // Generate a new JWT token for the user
      const payload = { username: user.username, sub: user.id };
      const token = this.jwt.sign(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: '60m',
      });
      return { access: true, token: token };
    } else {
      throw new UnauthorizedException('Invalid 2FA token.');
    }
  }

  anonc = 0;

  @Get('anon')
  async anonSignIn(@Req() req: Request | any, @Res() res: Response) {
    const host = new URL(req.headers.referer).hostname;
    const name = '$anon' + this.anonc++;
    if (!(await this.user.findOne(name)))
      await this.user.create({ login: name, username: name });
    const t = this.jwt.sign({ login: name });
    res.redirect(this.redir(t, name));
  }
}
