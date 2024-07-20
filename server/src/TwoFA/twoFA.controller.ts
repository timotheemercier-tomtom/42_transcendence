import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { TwoFAService } from './twoFA.service';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../user/user.entity';

@Controller('api/2fa')
export class TwoFAController {
  constructor(
    private readonly twoFAAuthService: TwoFAService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('enable')
  async enable2FA(@Req() req: Request, @Body('password') password: string) {
    const user = req.user as User;
    const userToken = req.cookies['_intra_42_session_production'];

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const isPasswordValid = await this.authService.validatePassword(
      user.login,
      password,
    );
    if (!isPasswordValid) {
      throw new HttpException('Invalid password', 401);
    }

    await this.twoFAAuthService.enable2FA(userToken, password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('disable')
  async disable2FA(@Req() req: Request, @Body('password') password: string) {
    const user = req.user as User;
    const userToken = req.cookies['_intra_42_session_production'];

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const isPasswordValid = await this.authService.validatePassword(
      user.login,
      password,
    );
    if (!isPasswordValid) {
      throw new HttpException('Invalid password', 401);
    }

    await this.twoFAAuthService.disable2FA(userToken, password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async is2FAEnabled(@Req() req: Request) {
    const user = req.user as User;
    const userToken = req.cookies['_intra_42_session_production'];

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    return await this.twoFAAuthService.is2FAEnabled(user.login, userToken);
  }
}

// import { Controller, Get, Redirect } from '@nestjs/common';

// @Controller('2fa')
// export class TwoFAController {
//   @Get('settings')
//   @Redirect('https://profile.intra.42.fr/otp_settings/new', 302)
//   redirectTo2FASettings() {
//     return;
//   }
// }

// import { Controller, Get, Post, Req, Res, Body, UnauthorizedException, Redirect } from '@nestjs/common';
// import { TwoFAService } from './TwoFA.service';
// import { AuthService } from '../auth/auth.service';
// import { UserService } from '../user/user.service';
// import * as speakeasy from 'speakeasy';
// import * as QRCode from 'qrcode';

// @Controller('2fa')
// export class TwoFAController {
//   TwoFAService: any;
//   constructor(TwoFAService: any, private userService: UserService, private authService: AuthService) {
//       this.TwoFAService = TwoFAService;

//   }

//   @Get('generate')
//   async generate2FAsecret(req: any, res: any) {
//     const user = req.user;

//     if (!user) {
//       return res.status(401).json({ message: 'User not authenticated' });
//     }

//     if (user.isTwoFAenticationEnabled) {
//       return res.status(400).json({ message: '2FA already enabled!' });
//     }

//     const secret = this.TwoFAService.generate2FAsecret(user.login);

//     const otpAuthUrl = speakeasy.otpauthURL({
//       secret: secret,
//       label: `YourApp:${user.login}`,
//       issuer: 'YourApp',
//     });

//     try {
//       const qrCodeDataURL = await QRCode.toDataURL(otpAuthUrl);

//       return res.status(200).json({ qrCode: qrCodeDataURL });
//     } catch (error) {
//       console.error('Error generating QR code:', error);
//       return res.status(500).json({ message: 'Error generating QR code' });
//     }
//   }

//   @Post('enable')
//   async enableTwoFA(@Req() req: any, @Body() body: any, @Res() res: any) {
//     const user = req.user;

//     if (!user) {
//       return res.status(401).json({ message: 'User not authenticated' });
//     }

//     if (user.isTwoFAEnabled) {
//       return res.status(400).json({ message: '2FA already enabled!' });
//     }

//     const { token } = body;

//     const isValidToken = this.TwoFAService.validate2FaToken(
//       token,
//       user.twoFASecret,
//     );

//     if (!isValidToken) {
//       return res.status(401).json({ message: 'Invalid 2FA token' });
//     }

//     return res.status(200).json({ message: '2FA enabled successfully' });
//   }

//   @Post('2fa/verify')
//   async verify2FA(@Body() body: any, @Res() res: any) {
//     const { user, token } = body;
//     await this.userService.findOne(user.login);

//     if (!user) {
//       throw new UnauthorizedException('Invalid user');
//     }

//     const isValidToken = this.TwoFAService.validate2FaToken(
//       token,
//       user.twoFASecret,
//     );

//     if (!isValidToken) {
//       return res.status(401).json({ message: 'Invalid 2FA token' });
//     }

//       return Redirect('http://localhost:3000/auth/42');
//   }

// }
