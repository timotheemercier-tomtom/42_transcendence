import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib'
import QRCode from 'qrcode';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { TwoFA } from './twoFA.entity';


@Injectable()
export class TwoFAService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private twoFARepository: Repository<TwoFA>,
    private usersRepository: Repository<User>,
  ) {}

  async generateTwoFA(user: User) {
    const secret = authenticator.generateSecret();
    const appName = this.configService.get('TWOFA_APPNAME');
    if (!appName) {
      throw new Error("Configuration error: 'TWOFA_APPNAME' is not defined");
    }
    const otpAuthUrl = authenticator.keyuri(user.login, appName, secret);

    const twoFA = new TwoFA();
    twoFA.secret = secret;
    twoFA.otpAuthUrl = otpAuthUrl;
    twoFA.user = user;
    await this.twoFARepository.save(twoFA);

    // user.twoFAEnabled = true;
    // await this.userService.save(user);

    return { secret, otpAuthUrl };
  }

  async generateQRCode(otpauthUrl: string): Promise<string> {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl, {
        type: 'image/png',
        margin: 1,
        width: 200,
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error('Failed to generate QR code', error);
      throw new Error('Failed to generate QR code');
    }
  }

  async verifyTwoFACode(user: User, twoFACode: string): Promise<boolean> {
    if (!user.twoFA) {
      throw new Error('User 2FA not set up.');
    }
    return authenticator.verify({
      token: twoFACode,
      secret: user.twoFA.secret,
    });
  }

  async disableTwoFA(user: User): Promise<void> {
    if (!user.twoFA) {
      throw new Error('User 2FA not set up.');
    }
    await this.twoFARepository.delete({ user: user });
  }
}

//   createOtpAuthUrl(user: User): string {
//     const appName = 'YourAppName'; // This should be your application's name
//     const secret = user.twoFA.secret; // Assuming the user's 2FA secret is stored here

//     // Ensure you have a valid secret for the user
//     if (!secret) {
//       throw new Error('2FA secret not set for user');
//     }

//     // Generate and return the otpAuth URL
//     const otpAuthUrl = authenticator.keyuri(user.login, appName, secret);
//     return otpAuthUrl;
//   }

// The QRCode.toFileStream function generates a QR code for the given
// otpauthUrl and directly writes it to the stream, which is your HTTP
// response objec
//   async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
//     try {
//       // Generate QR code and pipe it to the response stream
//       await QRCode.toFileStream(stream, otpauthUrl, {
//         type: 'png',
//         width: 200, // Set the width of the QR code here
//         margin: 2,
//       });
//     } catch (error) {
//       throw new Error(`Failed to generate QR code: ${error}`);
//     }
//   }
