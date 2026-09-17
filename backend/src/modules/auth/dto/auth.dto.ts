import { IsEmail, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(8) @MaxLength(128) @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'password must contain letters and numbers' }) password!: string;
  @IsString() @MinLength(1) @MaxLength(160) fullName!: string;
}

export class LoginDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(1) password!: string;
}

export class RefreshDto {
  @IsString() refreshToken!: string;
}

export class UpdateProfileDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(160) fullName?: string;
  @IsOptional() @IsString() @MaxLength(2048) avatarUrl?: string | null;
}

export class VerifyEmailDto {
  @IsOptional() @IsUUID() userId?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsString() @MinLength(1) token!: string;
}

export class RequestVerificationDto {
  @IsEmail() email!: string;
}

export class ForgotPasswordDto {
  @IsEmail() email!: string;
}

export class ResetPasswordDto {
  @IsOptional() @IsUUID() userId?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsString() @MinLength(1) token!: string;
  @IsString() @MinLength(8) @MaxLength(128) @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'password must contain letters and numbers' }) password!: string;
}

export class ChangePasswordDto {
  @IsString() currentPassword!: string;
  @IsString() @MinLength(8) @MaxLength(128) @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'password must contain letters and numbers' }) newPassword!: string;
}

export class AccountPasswordDto {
  @IsString() password!: string;
}

export class GoogleLoginDto {
  @IsOptional() @IsString() accessToken?: string;
  @IsOptional() @IsString() idToken?: string;
  @IsOptional() @IsString() credential?: string;
  @IsOptional() @IsEmail() demoEmail?: string;
  @IsOptional() @IsString() demoName?: string;
  @IsOptional() @IsString() demoAvatar?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsString() avatarUrl?: string;
}
