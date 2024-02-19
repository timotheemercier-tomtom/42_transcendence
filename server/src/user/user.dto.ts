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
  login?: string;

  @IsOptional()
  @MinLength(3, { message: 'Username must have atleast 3 characters.' })
  readonly username?: string;

  @IsOptional()
  @IsString()
  twoFA?: string;

  @IsOptional()
  @IsString()
  picture?: string;
}

export class TwoFACodeDto {
  @IsString()
  twoFACode: string;
}

// Add any additional properties you need to send to the frontend
// Make sure to exclude sensitive information like passwords
//   @IsAlphanumeric(null, {
//     message: 'Username does not allow other than alpha numeric chars.',
//   })
