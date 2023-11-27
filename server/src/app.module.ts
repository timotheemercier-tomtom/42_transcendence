import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { HealthController } from './health/health.controller';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';

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
    entities: [User],
    synchronize: configService.get<boolean>('TYPEORM_SYNC', false),
  }),
});

@Module({
  imports: [
    ConfigModule.forRoot(),
    ChatModule,
    AuthModule,
    typeOrmModule,
    TerminusModule,
    UserModule,
  ],

  // imports: [ChatModule, AuthModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
