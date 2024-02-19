import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TwoFAService } from './twoFA.service';
import { TwoFACodeDto } from './twoFACode.dto';
import { toDataURL } from 'qrcode';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFAController {
  constructor(
    private readonly twoFAService: TwoFAService,
    private userService: UserService,
  ) {}

  @Get('generate')
  async generateTwoFASecret(req: any, res: any) {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (user.twoFA) {
      return res.status(400).json({ message: '2FA already enabled!' });
    }

    try {
      const { secret, twoFA } = await this.twoFAService.generateTwoFA(user);

      const qrCodeDataURL = await toDataURL(twoFA);

      return res.status(200).json({ qrCode: qrCodeDataURL });
    } catch (error) {
      console.error('Error generating QR code:', error);
      return res.status(500).json({ message: 'Error generating QR code' });
    }
  }
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

  @Post('enable')
  //   @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async enableTwoFA(@Req() req: any): Promise<{ twoFA?: string }> {
    const { twoFA } = await this.twoFAService.generateTwoFA(req.user);
    return { twoFA };
  }

  // async turnOnTwoFA(@Req() req: any, @Body() { twoFACode }: TwoFACodeDto) {
  //     const isCodeValid = this.twoFAService.isTwoFACodeValid(twoFACode, req.user);
  //     if (!isCodeValid) {
  //       throw new UnauthorizedException('Wrong authentication code');
  //     }
  //     await this.userService.turnOnTwoFA(req.user.login);

  @Post('disable')
  @UseGuards(JwtAuthGuard)
  async disableTwoFA(@Req() req: any) {
    await this.userService.setTwoFA(req.user.login, undefined);
    return { message: 'Two-factor authentication disabled successfully.' };
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  async verify2FA(
    @Req() req: any,
    @Body() { TwoFACode: twoFACode }: TwoFACodeDto,
  ) {
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
