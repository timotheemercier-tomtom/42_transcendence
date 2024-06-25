/**
 * ? AppModule
 * The root module of the application. It integrates various feature modules and configures
 * global settings, database connections, and other core functionalities.
 *
 ** ConfigModule
 * Configures global settings for the application.
 ** ChatModule, AuthModule, UserModule
 * Feature modules for different aspects of the application.
 ** TypeOrmModule
 * Configures ORM (Object-Relational Mapping) for database interaction.
 ** TerminusModule
 * Used for health checks.
 ** JwtModule
 * Handles JSON Web Token integration.
 *
 * The AppModule uses dependency injection to incorporate these modules and configures TypeORM with
 * the PostgreSQL database. It sets up a global configuration accessible throughout the application.
 *
 * ? typeOrmModule
 * Configures TypeORM asynchronously, enabling the use of external configuration sources like the ConfigService.
 * This approach allows setting database connection parameters through environment variables or other config mechanisms.
 *
 * ? useFactory
 * A factory function used by TypeOrmModule.forRootAsync() to configure the TypeORM connection.
 * It receives an instance of ConfigService to access environment-specific configurations.
 *
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { HealthController } from './health/health.controller';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { Friend } from './user/friend.entity';
import { StatusModule } from './status/status.module';
import { GameModule } from './game/game.module';
import { MatchHistory } from './game/matchhistory.entity';

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
    entities: [User, Friend, MatchHistory],
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
    ChatModule,
    AuthModule,
    typeOrmModule,
    TerminusModule,
    UserModule,
    JwtModule,
    StatusModule,
    GameModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
