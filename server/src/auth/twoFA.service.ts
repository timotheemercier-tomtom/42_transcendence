import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import * as QRCode from 'qrcode';
import * as speakeasy from 'speakeasy';
import { TwoFA } from 'common';

@Injectable()
export class TwoFAService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async setTwoFA(user: User, twoFA: TwoFA): Promise<User> {
    user.twoFAsecret = twoFA.secret;
    user.otpAuthUrl = twoFA.otpAuthUrl;
    return this.usersRepository.save(user);
  }
  // method to generate a 2FA secret for a user. This method generates a secret
  // and a QR code URL.
  async generateTwoFA(user: User) {
    const secret = speakeasy.generateSecret({ length: 20 });
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: encodeURIComponent(`@Pong42:${user.login}`),
      issuer: '@Pong42',
    });
    return this.setTwoFA(user, {
      secret: secret.base32,
      otpAuthUrl: otpauthUrl,
    });
  }

  // method to generate a QR code image URL from the otpauthUrl.
  async getQRCodeDataURL(otpauthUrl: string): Promise<string> {
    return QRCode.toDataURL(otpauthUrl);
  }
    
  async validateTwoFA(user: User, token: string) {
    return speakeasy.totp.verify({
      secret: user.twoFAsecret,
      encoding: 'base32',
      token: token,
    });
  }

}
