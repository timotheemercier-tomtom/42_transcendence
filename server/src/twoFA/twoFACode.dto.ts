import { IsString } from 'class-validator';

export class TwoFACodeDto {
  @IsString()
  TwoFACode: string;
}
