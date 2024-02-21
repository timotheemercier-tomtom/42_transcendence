import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UserDto {
  @IsOptional()
  @IsString()
  readonly login?: string;

  @IsOptional()
  @Transform(({ obj }: any) => !!obj.twoFA)
  twoFAEnabled?: boolean;

  @IsOptional()
  @IsString()
  readonly username?: string;

  @IsOptional()
  @IsString()
  readonly picture?: string;
}

// Add any additional properties you need to send to the frontend
// Make sure to exclude sensitive information like passwords
//   @IsAlphanumeric(null, {
//     message: 'Username does not allow other than alpha numeric chars.',
//   })
