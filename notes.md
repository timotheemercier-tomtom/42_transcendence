### USER

```typescript
class User {
  id: number;
  username: string;
  login: string;
  picture: string;
}
```

* PROPERTIES 
`userRepository: Repository<User>`

* FIND USER BY USER NAME
`async findUser(username: string): Promise<User | null> `

* CREATE USER
`async createUser(userData: Partial<User>): Promise<User>`

* UPDATE USER 
`async updateUser(username: string, updateUserDto: UpdateUserDto): Promise<User>`

import { Controller, Post, Body, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { TwoFAService } from './twoFA.service';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwt: JwtService,
    private userService: UserService,
    private config: ConfigService,
    private twoFAService: TwoFAService,
  ) {}

  @Post('login')
  async login(@Body() body: any, @Res() res: any) {
    const { username, password } = body;
    const user = await this.authService.validateUser(username, password);

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    if (user.isTwoFactorAuthenticationEnabled) {
      return res.status(200).json({ message: '2FA required', userId: user.id });
    }

    const jwt = await this.authService.login(user);
    return res.status(200).json(jwt);
  }

  @Post('2fa/verify')
  async verify2FA(@Body() body: any, @Res() res: any) {
    const { userId, token } = body;
    const user = await this.userService.findOneById(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    const isValidToken = this.twoFAService.validate2FaToken(
      token,
      user.twoFactorAuthenticationSecret,
    );

    if (!isValidToken) {
      return res.status(401).json({ message: 'Invalid 2FA token' });
    }

    const jwt = await this.authService.login(user);
    return res.status(200).json(jwt);
  }

  @Get('42')
  @UseGuards(AuthGuard('42'))
  async signInWith42() {}

  redir(host: string, token: string, login: string) {
    return `http://${this.config.get('HOST')}:5173/?token=${token}&u=${login}`;
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

    res.redirect(this.redir(host, accessToken, user.login));
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
    res.redirect(this.redir(host, accessToken, name));
  }
}
