// import { Module } from '@nestjs/common';
// import { TwoFAController } from './TwoFA.controller';

// @Module({
//   controllers: [TwoFAController],
// })
// export class TwoFactorAuthModule {}


import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TwoFAService } from './twoFA.service';
import { TwoFAController } from './twoFA.controller';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [HttpModule],
  providers: [TwoFAService, AuthService],
  controllers: [TwoFAController],
})
export class TwoFAModule {}
