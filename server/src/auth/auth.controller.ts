import {
  Get,
  Req,
  Res,
  UseGuards,
  Controller,
  UnauthorizedException,
  Param,
  Post,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
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
    } else {
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
    @Param('token') twofa_token: string,
  ) {
    const user: User | null = await this.userService.findOne(login);

    if (user && user.twoFASecret) {
      const twoFAok: boolean = this.authService.validateTwoFAToken(
        user.twoFASecret,
        twofa_token,
      );
      if (twoFAok) {
        const token = this.jwt.sign({ login });
        req.headers.referer = `http://${this.config.get('HOST')}:5173`;
        res.send(
          `http://${this.config.get('HOST')}:5173/?token=${token}&u=${login}`,
        );
      } else {
        // wrong 2fa code:
        console.error(`error: wrong two-fa token entered by user ${login}`);
        res.send('');
      }
    } else {
      console.error(`error: two-fa not enabled!`);
    }
  }
}
