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
import { AuthService } from './auth.service';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: '42' }),
    ConfigModule,
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'), // Use an environment variable for the secret
        signOptions: { expiresIn: '60m' }, // Token expiration time
      }),
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}




//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: (configService: ConfigService) => ({
//         secret: configService.get('JWT_SECRET'), // Use an environment variable for the secret
//         signOptions: { expiresIn: '60m' }, // Token expiration time
//       }),

// JwtModule.registerAsync({
//     useFactory: (config: ConfigService) => {
//       return {
//         secret: config.get<string>('JWT_SECRET_KEY'),
//         signOptions: {
//           expiresIn: config.get<string | number>('JWT_EXPIRATION_TIME'),
//         },
//       };
//     },
//     inject: [ConfigService],
//   }),
