import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserService } from '../user/user.service';
import { TwoFAService } from './twoFA.service';

@Controller('2fa')
@UseGuards(JwtAuthGuard)
export class TwoFAController {
  constructor(
    private readonly twoFAService: TwoFAService,
    private readonly userService: UserService,
  ) {}

  @Get('generate')
  @UseGuards(JwtAuthGuard) // Assuming JWT-based authentication
  async generateTwoFASecret(@Req() req: any, @Res() res: any) {
    const user = await this.userService.findOneWithTwoFA(req.user.login);

    if (!user) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'User not authenticated' });
    }

    if (user.twoFA) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: '2FA already enabled!' });
    }

    try {
      const { otpAuthUrl } = await this.twoFAService.generateTwoFA(user);
      const qrCodeDataURL = await this.twoFAService.generateQRCode(otpAuthUrl);

      return res.status(HttpStatus.OK).json({
        qrCode: qrCodeDataURL,
        message: '2FA secret generated successfully.',
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error generating QR code' });
    }
  }

  @Post('enable')
  async enableTwoFA(
    @Req() req: any,
    @Body() body: { twoFACode: string },
    @Res() res: any,
  ) {
    const user = await this.userService.findOneWithTwoFA(req.user.login);
    if (!user) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'User not authenticated' });
    }

    // Attempt to enable 2FA
    const isCodeValid = await this.twoFAService.verifyTwoFACode(
      user,
      body.twoFACode,
    );
    if (isCodeValid) {
      return res
        .status(HttpStatus.OK)
        .json({ message: '2FA enabled successfully.' });
    } else {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Invalid 2FA code.' });
    }
  }

  @Post('disable')
  async disableTwoFA(@Req() req: any, @Res() res: any) {
    const user = await this.userService.findOneWithTwoFA(req.user.login);
    if (!user || !user.twoFA) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: '2FA is not enabled.' });
    }

    // Perform disable operation
    await this.twoFAService.disableTwoFA(user);
    return res
      .status(HttpStatus.OK)
      .json({ message: '2FA disabled successfully.' });
  }

  @Post('validate')
  async validateTwoFA(
    @Req() req: any,
    @Body() body: { twoFACode: string },
    @Res() res: any,
  ) {
    const user = await this.userService.findOneWithTwoFA(req.user.login);
    if (!user || !user.twoFA) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: '2FA is not enabled.' });
    }

    const isCodeValid = await this.twoFAService.verifyTwoFACode(
      user,
      body.twoFACode,
    );
    if (isCodeValid) {
      return res
        .status(HttpStatus.OK)
        .json({ message: '2FA code validated successfully.' });
    } else {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Invalid 2FA code.' });
    }
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
