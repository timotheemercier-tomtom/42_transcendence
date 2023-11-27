/**
 * Organizes our authentication-related controllers and services.
 * t's a crucial part of structuring your application in a modular way.
 */

import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';

@Module({
  imports: [PassportModule.register({ defaultStrategy: '42' })],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
