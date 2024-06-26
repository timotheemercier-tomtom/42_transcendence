import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { MatchHistory } from './matchhistory.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [AuthModule, UserModule, TypeOrmModule.forFeature([MatchHistory])],
  providers: [GameService, GameGateway, UserService],
  exports: [TypeOrmModule, GameService],
  controllers: [GameController],
})
export class GameModule {}
