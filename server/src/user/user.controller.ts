import {
  Body,
  Controller,
  Get,
  HttpException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Session,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserDto } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';
import { FriendService } from './friend.service';
import { JwtService } from '@nestjs/jwt';
import { ValidateResult } from 'src/auth/fourtwo.strategy';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private friendService: FriendService,
    private jwtService: JwtService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUser(@Req() req: any): Promise<User | null> {
    return await this.userService.findOne(req.user.login);
  }

  @Get(':login')
  @UseGuards(JwtAuthGuard)
  async findUser(
    @Req() req: Request & any,
    @Param('login') login: string,
  ): Promise<User | null> {
    const user = await this.userService.findOne(login);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Patch(':login')
  async updateUser(
    @Param('login') login: string,
    @Body() userDto: UserDto,
    @Req() req: Request & any,
  ): Promise<User> {
    const user = req.user;
    if (user.login !== login) {
      throw new UnauthorizedException();
    }

    // Extracting image data if present
    const base64Image = userDto.picture;
    delete userDto.picture; // Remove the image data from the DTO to prevent direct assignment

    return await this.userService.update(login, userDto, base64Image);
  }

  // API endpoint to generate the 2FA secret and QR code, and sends the QR code
  // data URL back to the frontend.

  @Post('enable-2fa')
  async enableTwoFA(@Session() session: any) {
    const user = session.user; // Assume user is stored in session
    const { secret, otpauthUrl } =
      await this.userService.generateTwoFASecret(user);
    const qrCodeDataURL = await this.userService.getQRCodeDataURL(otpauthUrl);

    // Store the secret temporarily, ideally in session or a temporary storage,
    // until verification
    session.tempSecret = secret;

    return { qrCodeDataURL };
  }

  
  @Post('verify-2fa')
  async verifyTwoFA(
    @Body() body: { login: string; accessToken: string },
  ): Promise<{ access: boolean; token?: string }> {
      const { login, accessToken } = body;
      const user = await this.userService.findOne(login);
    if (!user?.secret) {
      throw new UnauthorizedException('2FA not setup.');
    }

    const verified = speakeasy.totp.verify({
      secret: user.secret,
      encoding: 'base32',
      token: ,
    });

    if (verified) {
      // Generate a new JWT token for the user
      const payload = { login: user?.login };
      const token = this.jwtService.sign(payload, {
        //   const token = this.jwt.sign(payload, {
        expiresIn: '60m',
      });
      return { access: true, token: token };
    } else {
      throw new UnauthorizedException('Invalid 2FA token.');
    }
  }

  // This endpoint checks the provided 2FA token against the user's stored secret.
  // If the verification succeeds, it generates a new JWT token for the user to
  // proceed with their authenticated session.

  //   @Post('verify-2fa')
  //   @UseGuards(JwtAuthGuard)
  //   async verifyTwoFA(
  //     @Req() req: any,
  //     @Body() body: { token: string },
  //   ): Promise<{ access: boolean; token?: string }> {
  //     const { token } = body;
  //     const user = await this.userService.findOne(req.user.login);

  //     if (!user || !user.secret) {
  //       throw new UnauthorizedException('2FA not setup or user not found.');
  //     }

  //     const verified = speakeasy.totp.verify({
  //       secret: user.secret,
  //       encoding: 'base32',
  //       token,
  //     });

  //     if (verified) {
  //       // Assuming you have a method to generate a new JWT token
  //       const newAccessToken = this.jwt.sign({ login: user.login });
  //       return { access: true, token: newAccessToken };
  //     } else {
  //       throw new UnauthorizedException('Invalid 2FA token.');
  //     }
  //   }

  // Add to src/user/user.controller.ts
  //   @Post('verify-2fa')
  //   async verifyTwoFA(@Body() body: { token: string }, @Session() session: any) {
  //     const { token } = body;
  //     const { tempSecret } = session;

  //     const verified = speakeasy.totp.verify({
  //       secret: tempSecret.base32,
  //       encoding: 'base32',
  //       token,
  //     });

  //     if (verified) {
  //       // Persist the 2FA secret for the user in your database
  //       // Clear the tempSecret from the session
  //     }

  //     return { verified };
  //   }

  //   @Post(':login/2fa/generate')
  //   @UseGuards(JwtAuthGuard)
  //   async generateTwoFactorAuthenticationSecret(@Req() req: any) {
  //     const { otpauthUrl } = await this.twoFAService.generateTwoFASecret(
  //       req.user,
  //     );
  //     const qrCode = await this.twoFAService.generateQRCode(otpauthUrl);
  //     return { qrCode };
  //   }

  //   @Post(':login/2fa/verify')
  //   @UseGuards(JwtAuthGuard)
  //   async verifyTwoFactorAuthenticationToken(
  //     @Req() req: any,
  //     @Body() { token }: { token: string },
  //   ) {
  //     const isTokenValid = await this.twoFAService.verifyTwoFAToken(
  //       req.user,
  //       token,
  //     );
  //     if (!isTokenValid) {
  //       throw new UnauthorizedException('Invalid 2FA token');
  //     }
  //     // Optionally, update user entity to indicate 2FA is enabled
  //     return { message: '2FA is successfully enabled' };
  //   }

  @Post(':login/friend/:friend')
  async toggleFriend(
    @Param('login') login: string,
    @Param('friend') friendId: string,
  ): Promise<any> {
    if (await this.friendService.isFriend(login, friendId)) {
      this.friendService.removeFriend(login, friendId);
      return { message: 'Friend removed successfully' };
    } else {
      this.friendService.addFriend(login, friendId);
      return { message: 'Friend added successfully' };
    }
  }

  @Get(':login/friends')
  @UseGuards(JwtAuthGuard)
  async listAllFriends(@Param('login') login: string): Promise<User[]> {
    return this.friendService.getFriends(login);
  }
}
