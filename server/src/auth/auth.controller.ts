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

  @Get('42/callback')
  @UseGuards(AuthGuard('42'))
  async fortyTwoAuthRedirect(@Req() req: any, @Res() res: Response) {
    const { accessToken } = req.user;
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
    });
    res.redirect('http://localhost:5173/login');
  }
}
