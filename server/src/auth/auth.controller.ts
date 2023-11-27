/**
 * Handle HTTP requests related to user authentication.
 * Includes functions for logging in, logging out, and handling OAuth callbacks.
 */

import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  @Get('42')

  @UseGuards(AuthGuard('42'))
  async signInWith42() {}
  
  @Get('42/callback')    /** initiate the OAuth process with 42's API. */
  @UseGuards(AuthGuard('42'))
  /* handle the callback from 42's intra.
     It returns the user information obtained from the validate method. */
  async fortyTwoAuthRedirect(@Req() req: any) {

    return req.user;
  }
}
