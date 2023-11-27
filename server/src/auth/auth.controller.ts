/**
 * Handle HTTP requests related to user authentication.
 * Includes functions for logging in, logging out, and handling OAuth callbacks.
 */

import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('42')
  @UseGuards(AuthGuard('42'))
  async signInWith42() {}

  @Get('42/callback') /** initiate the OAuth process with 42's API. */
  @UseGuards(AuthGuard('42'))
  /* handle the callback from 42's intra.
     It returns the user information obtained from the validate method. */
  async fortyTwoAuthRedirect(@Req() req: any) {
    return req.user;
  }

  @Post('login')
  async login(@Req() req: Request, @Res() res: Response) {
    const user = req.user; // Assuming user is set in the request after successful authentication
    const jwt = await this.authService.login(user);
    res.cookie('accessToken', jwt.accessToken, {
      httpOnly: true, // The cookie is not accessible via client-side script
      secure: true, // The cookie is only sent over HTTPS
      // Set other cookie options as needed (e.g., maxAge, domain, path)
    });
    res.status(HttpStatus.OK).send({ message: 'Login successful' });
  }
}
