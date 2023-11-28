/**
 * Organizes our authentication-related controllers and services.
 * t's a crucial part of structuring your application in a modular way.
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

