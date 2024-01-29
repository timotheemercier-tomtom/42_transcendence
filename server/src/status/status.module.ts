import { Module } from '@nestjs/common';
import { StatusGateway } from './status.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [AuthModule, UserModule],
  providers: [StatusGateway],
})
export class StatusModule {}
