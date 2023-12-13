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
import { Repository } from 'typeorm';


@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule],
  providers: [UserService, JwtStrategy, JwtAuthGuard, ConfigService, AuthService, Repository],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
