import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  readonly username?: string;
  readonly login?: string;


  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @IsString()
  readonly picture?: string;
}

// Add any additional properties you need to send to the frontend
// Make sure to exclude sensitive information like passwords
