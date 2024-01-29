import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

const passwordRegEx =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{8,20}$/;

export class UserDto {
  @IsNotEmpty()
  @IsString()
  login: string;

  @IsOptional()
  @MinLength(3, { message: 'Username must have atleast 3 characters.' })
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
