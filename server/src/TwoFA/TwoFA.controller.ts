import { Controller, Get, Post, Req, Res, Body, UnauthorizedException, Redirect } from '@nestjs/common';
import { TwoFAService } from './TwoFA.service';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Controller('2fa')
export class TwoFAController {
  TwoFAService: any;
  constructor(TwoFAService: any, private userService: UserService, private authService: AuthService) {
      this.TwoFAService = TwoFAService;
      
  }

  @Get('generate')
  async generate2FAsecret(req: any, res: any) {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (user.isTwoFactorAuthenticationEnabled) {
      return res.status(400).json({ message: '2FA already enabled!' });
    }

    const secret = this.TwoFAService.generate2FAsecret(user.login);

    const otpAuthUrl = speakeasy.otpauthURL({
      secret: secret,
      label: `YourApp:${user.login}`,
      issuer: 'YourApp',
    });

    try {
      const qrCodeDataURL = await QRCode.toDataURL(otpAuthUrl);

      return res.status(200).json({ qrCode: qrCodeDataURL });
    } catch (error) {
      console.error('Error generating QR code:', error);
      return res.status(500).json({ message: 'Error generating QR code' });
    }
  }

  @Post('enable')
  async enableTwoFA(@Req() req: any, @Body() body: any, @Res() res: any) {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (user.isTwoFAEnabled) {
      return res.status(400).json({ message: '2FA already enabled!' });
    }

    const { token } = body;

    const isValidToken = this.TwoFAService.validate2FaToken(
      token,
      user.twoFASecret,
    );

    if (!isValidToken) {
      return res.status(401).json({ message: 'Invalid 2FA token' });
    }

    return res.status(200).json({ message: '2FA enabled successfully' });
  }
    
    
  @Post('2fa/verify')
  async verify2FA(@Body() body: any, @Res() res: any) {
    const { user, token } = body;
    await this.userService.findOne(user.login);
    
    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    const isValidToken = this.TwoFAService.validate2FaToken(
      token,
      user.twoFASecret,
    );

    if (!isValidToken) {
      return res.status(401).json({ message: 'Invalid 2FA token' });
    }

      return Redirect('http://localhost:3000/auth/42');
  }

}
