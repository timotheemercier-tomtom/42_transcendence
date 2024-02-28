import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { TwoFAService } from '../auth/twoFA.service';
import { JwtService } from '@nestjs/jwt';

@Controller('2fa')
export class UserController {
  constructor(
    private userService: UserService,
    private twoFAService: TwoFAService,
    private jwtService: JwtService,
  ) {}

  @Post(':enable')
  async enableTwoFA(user: User) {
    const { otpAuthUrl } = await this.twoFAService.generateTwoFA(user);
    const qrCodeDataURL = await this.twoFAService.getQRCodeDataURL(otpAuthUrl);

    return { qrCodeDataURL };
  }

  @Post('verify')
  async verifyTwoFA(
    @Body() body: { login: string; token: string },
  ): Promise<{ access: boolean; token?: string }> {
    const { login, token } = body;
    const user = await this.userService.findOneWithTwoFA(login);
    const verified = await this.twoFAService.validateTwoFA(
      user,
      user?.twoFAsecret,
    );
    if (verified) {
      // Generate a new JWT token for the user
      const payload = { login: (await user)?.login };
      const token = this.jwtService.sign(payload, {
        expiresIn: '60m',
      });
      return { access: true, token: token };
    } else {
      throw new UnauthorizedException('Invalid 2FA token.');
    }
  }
}
