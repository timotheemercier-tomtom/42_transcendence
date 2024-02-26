/**
 * This file is part of a NestJS application and is responsible for setting up user authentication.
 * It organizes our authentication-related controllers and services.
 *
 *? Module Setup:
 * It serves as the configuration module for user authentication.
 * Imports necessary modules and dependencies for authentication.
 *
 *? Passport Module:
 * Registers the PassportModule with a default strategy named '42' for authentication.
 *
 *? JWT Configuration:
 * Configures the JwtModule asynchronously to manage JWT token creation and validation.
 * Uses the ConfigService to retrieve the JWT secret from environment variables.
 *
 *? Providers and Controllers:
 * Provides the AuthService as a service for handling authentication logic.
 * Includes the AuthController for handling HTTP requests related to authentication.
 */

import { PassportModule } from '@nestjs/passport';
import { FourTwoStrategy } from './fourtwo.strategy';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: '42' }),
    ConfigModule,
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        // signOptions: { expiresIn: '60m' },
      }),
    }),
  ],
  providers: [FourTwoStrategy, AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
