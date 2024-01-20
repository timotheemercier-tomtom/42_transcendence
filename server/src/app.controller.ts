/**
 * ? `AppController`
 * Manages the primary routes of the application.
 *
 * ? `getHello`
 * Handles the root GET request and returns a welcome message.
 * It uses AppService to obtain the response.
 * @return {string} - The welcome message.
 */ 

import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('login')
  login(): any {
    return {};
  }

  // set up to protected in order to protect access for non log user 

  @Get('protected')
  getHello(): string {
    return this.appService.getHello();
  }
}
