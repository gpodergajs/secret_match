import { IsEmail, IsObject, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterUserDto {
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  readonly email: string;

  @IsString({ message: 'Password must be a string.' })
  //@MinLength(8, { message: 'Password must be at least 8 characters long.' })
  //@MaxLength(32, { message: 'Password cannot exceed 32 characters.' })
  // For example, require at least one uppercase, one lowercase, one number, one special character:
  /*@Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )*/
  readonly password: string;

  @IsString({ message: 'Full name must be a string.' })
  @MinLength(2, { message: 'Full name must be at least 2 characters long.' })
  @MaxLength(50, { message: 'Full name cannot exceed 50 characters.' })
  readonly name: string;

  @IsOptional()
  @IsString({ message: 'Message must be a string.' })
  @MaxLength(500, { message: 'Message cannot exceed 500 characters.' })
  readonly message?: string;

  @IsOptional()
  @IsObject({ message: 'Preferences must be a valid object.' })
  readonly preferences?: Record<string, any>;
}