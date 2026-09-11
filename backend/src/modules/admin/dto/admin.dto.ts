import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** UC-SYS-01: Query parameters for global user search */
export class ListUsersQueryDto {
  @IsOptional() @IsString() @MaxLength(320) email?: string;
  @IsOptional() @IsIn(['active', 'deactivated', 'suspended']) status?: 'active' | 'deactivated' | 'suspended';
  @IsOptional() @IsString() page?: string;
  @IsOptional() @IsString() limit?: string;
}

/** UC-SYS-01: Update a user's account status (suspend / activate). Self-lockout is prevented server-side. */
export class AdminUpdateUserStatusDto {
  @IsIn(['active', 'deactivated', 'suspended']) status!: 'active' | 'deactivated' | 'suspended';
}

/** UC-SYS-02: Update an organization's status or service plan. */
export class AdminUpdateOrganizationDto {
  @IsOptional() @IsIn(['active', 'suspended']) status?: 'active' | 'suspended';
  @IsOptional() @IsString() @MinLength(2) @MaxLength(64) plan?: string;
}

export class AdminCreateUserDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(1) @MaxLength(160) fullName!: string;
  @IsOptional() @IsString() @MinLength(8) @MaxLength(128) password?: string;
  @IsOptional() @IsIn(['active', 'deactivated', 'suspended']) status?: 'active' | 'deactivated' | 'suspended';
  @IsOptional() @IsBoolean() isSystemAdmin?: boolean;
  @IsOptional() @IsBoolean() sendVerificationEmail?: boolean;
}

export class AdminUpdateUserDto {
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @MinLength(1) @MaxLength(160) fullName?: string;
  @IsOptional() @IsString() @MinLength(8) @MaxLength(128) password?: string;
  @IsOptional() @IsIn(['active', 'deactivated', 'suspended']) status?: 'active' | 'deactivated' | 'suspended';
  @IsOptional() @IsBoolean() isSystemAdmin?: boolean;
  @IsOptional() @IsString() @MaxLength(2048) avatarUrl?: string | null;
}

export class AdminTestMailDto {
  @IsEmail() to!: string;
  @IsOptional() @IsString() @MaxLength(200) subject?: string;
}
