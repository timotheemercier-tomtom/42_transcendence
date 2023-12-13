/**
 * ? UserModule
 * Manages the user-related functionalities in the application.
 * It includes services and controllers related to user operations.
 * 
 * Integrates TypeOrmModule for database interaction specific to the User entity.
 * Configures JwtModule for handling JSON Web Tokens in user-related operations.
 *
 * Imports:
 * - TypeOrmModule.forFeature([User]): Includes the User entity in the TypeORM context.
 * - JwtModule: Provides JWT functionality for authentication.
 *
 * Providers:
 * .UserService: Business logic for user operations.
 * .JwtStrategy: Strategy for JWT authentication.
 * .JwtAuthGuard: Guard for JWT-based route protection.
 * .ConfigService: Access to the configuration variables.
 * .AuthService: Authentication related logic.
 * .Repository: TypeORM repository for data access.
 *
 * Exports:
 * - UserService: Makes UserService available outside this module.
 *
 * Controllers:
 * - UserController: Controllers handling HTTP requests related to users.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule],
  providers: [UserService, JwtStrategy, JwtAuthGuard, ConfigService, AuthService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
