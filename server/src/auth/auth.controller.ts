import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


@Controller('auth')
export class AuthController {
  @Get('42')
  @UseGuards(AuthGuard('42'))
  async signInWith42() {
    // Initiates the OAuth process
  }

  @Get('42/callback')
  @UseGuards(AuthGuard('42'))
  async fortyTwoAuthRedirect(@Req() req:any) {
    // Handles the callback from 42's intra
    return req.user; // This will be the user info from the validate method
  }
}
