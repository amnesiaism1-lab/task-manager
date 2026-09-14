import { IsEmail, IsIn, IsOptional, IsString, IsUUID, Length, MinLength } from 'class-validator';

export class CreateOrganizationDto {
  @IsString() @Length(2, 32) @MinLength(2) key!: string;
  @IsString() @Length(1, 160) name!: string;
}

export class InviteMemberDto {
  @IsEmail() email!: string;
  @IsOptional() @IsUUID() roleId?: string;
}

export class AcceptInvitationDto {
  @IsOptional() @IsUUID() invitationId?: string;
  @IsOptional() @IsString() token?: string;
}

/** UC-ORG-10: Invitee declines a pending invitation. */
export class DeclineInvitationDto {
  @IsUUID() invitationId!: string;
  @IsOptional() @IsString() token?: string;
}

export class UpdateMemberStatusDto {
  @IsIn(['active', 'suspended']) status!: 'active' | 'suspended';
}

export class CreateDepartmentDto {
  @IsString() @Length(1, 120) name!: string;
  @IsOptional() @IsString() @Length(0, 2000) description?: string;
  @IsOptional() @IsUUID() parentDepartmentId?: string;
  @IsOptional() @IsUUID() leadMemberId?: string;
}

export class CreateGroupDto {
  @IsString() @Length(1, 120) name!: string;
  @IsOptional() @IsString() @Length(0, 2000) description?: string;
}

export class AddMemberDto {
  @IsUUID() memberId!: string;
  @IsOptional() @IsString() roleInDepartment?: string;
}

export class UpdateDepartmentDto {
  @IsString() @Length(1, 120) name!: string;
  @IsOptional() @IsString() @Length(0, 2000) description?: string | null;
  @IsOptional() @IsUUID() parentDepartmentId?: string | null;
  @IsOptional() @IsUUID() leadMemberId?: string | null;
}

export class UpdateGroupDto {
  @IsString() @Length(1, 120) name!: string;
  @IsOptional() @IsString() @Length(0, 2000) description?: string | null;
}

export class UpdateOrganizationDto {
  @IsString() @Length(1, 160) name!: string;
  @IsOptional() @IsIn(['active', 'suspended']) status?: 'active' | 'suspended';
}

export class CreateOrgRoleDto {
  @IsString() @Length(2, 64) key!: string;
  @IsString() @Length(1, 120) name!: string;
  @IsOptional() @IsString() @Length(0, 2000) description?: string;
  @IsOptional() permissionKeys?: string[];
}

export class AssignOrgRoleDto {
  @IsUUID() memberId!: string;
  @IsUUID() roleId!: string;
}
