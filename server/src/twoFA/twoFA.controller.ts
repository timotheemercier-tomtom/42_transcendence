import {
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
  Res,
  UseGuards,
  Req,
  Body,
  HttpCode,
  UnauthorizedException,
  Param,
} from '@nestjs/common';
import { TwoFAService } from './twoFA.service';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { TwoFACodeDto } from '../user/user.dto';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFAController {
  constructor(
    private readonly twoFAService: TwoFAService,
    private userService: UserService,
  ) {}

//   @Post('generate')
//   @UseGuards(JwtAuthGuard)
//   async register(@Res() res: Response, @Req() req: any) {
//     const { otpauthUrl } = await this.twoFAService.generateTwoFASecret(
//       req.user,
//     );
//     return this.twoFAService.pipeQrCodeStream(res, otpauthUrl);
//   }

  @Post('enable')
//   @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async enable2FA(@Req() req: any, ): Promise<{ otpAuthUrl: string }> {
    const { otpAuthUrl } = await this.twoFAService.generateTwoFASecret(req.user);
    return { otpAuthUrl };
}

// async turnOnTwoFA(@Req() req: any, @Body() { twoFACode }: TwoFACodeDto) {
//     const isCodeValid = this.twoFAService.isTwoFACodeValid(twoFACode, req.user);
//     if (!isCodeValid) {
//       throw new UnauthorizedException('Wrong authentication code');
//     }
//     await this.userService.turnOnTwoFA(req.user.login);
  

  @Post('disable')
  @UseGuards(JwtAuthGuard)
  async disable2FA(@Req() req: any) {
    await this.userService.turnOffTwoFA(req.user.login);
    return { message: 'Two-factor authentication disabled successfully.' };
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  async verify2FA(@Req() req: any, @Body() { twoFACode }: TwoFACodeDto) {
    const isCodeValid = this.twoFAService.isTwoFACodeValid(twoFACode, req.user);
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    return { message: 'Two-factor authentication verified successfully.' };
  }
}

// import { Controller, Get, Post, Req, Res, Body } from '@nestjs/common';
// import { TwoFAService } from './TwoFA.service';
// import * as speakeasy from 'speakeasy';
// import * as QRCode from 'qrcode';

// @Controller('2fa')
// export class TwoFAController {
//   TwoFAService: any;
//   constructor(TwoFAService: any) {
//     this.TwoFAService = TwoFAService;
//   }

//   @Get('generate')
//   async generate2FAsecret(req: any, res: any) {
//     const user = req.user;

//     if (!user) {
//       return res.status(401).json({ message: 'User not authenticated' });
//     }

//     if (user.isTwoFactorAuthenticationEnabled) {
//       return res.status(400).json({ message: '2FA already enabled!' });
//     }

//     const secret = this.TwoFAService.generate2FAsecret(
//       user.login,
//     );.id

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

//     if (user.isTwoFactorAuthenticationEnabled) {
//       return res.status(400).json({ message: '2FA already enabled!' });
//     }

//     const { token } = body;

//     const isValidToken = this.TwoFAService.validate2FaToken(
//       token,
//       user.twoFactorAuthenticationSecret
//     );

//     if (!isValidToken) {
//       return res.status(401).json({ message: 'Invalid 2FA token' });
//     }

//     return res.status(200).json({ message: '2FA enabled successfully' });
//   }
// }
