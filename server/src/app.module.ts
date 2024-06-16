// app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { JwtModule } from '@nestjs/jwt';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { StatusModule } from './status/status.module';
import { GameModule } from './game/game.module';
import { UserModule } from './user/user.module';
import { HealthController } from './health/health.controller';
import { UserController } from './user/user.controller';
import { User } from './user/user.entity';
import { Friend } from './user/friend.entity';

const typeOrmModule = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    entities: [User, Friend],
    synchronize: configService.get<boolean>('TYPEORM_SYNC', false),
    logging: false,
    migrations: [],
  }),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    typeOrmModule,
    TerminusModule,
    ChatModule,
    AuthModule,
    UserModule,
    JwtModule,
    StatusModule,
    GameModule,
  ],
  controllers: [HealthController, UserController],
  providers: [],
})
export class AppModule {}
