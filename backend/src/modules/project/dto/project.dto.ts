import { IsArray, IsIn, IsInt, IsISO8601, IsOptional, IsString, IsUUID, Length, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @IsString() @Length(2, 32) key!: string;
  @IsString() @Length(1, 160) name!: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsIn(['private', 'org', 'public']) visibility?: 'private' | 'org' | 'public';
  @IsOptional() @IsIn(['kanban', 'scrum']) boardType?: 'kanban' | 'scrum';
  @IsOptional() @IsUUID() departmentId?: string;
}

export class CreateIssueDto {
  @IsString() @Length(1, 255) summary!: string;
  @IsOptional() @IsString() @MaxLength(10000) description?: string;
  @IsString() @Length(1, 64) issueTypeKey!: string;
  @IsOptional() @IsUUID() assigneeMemberId?: string;
  @IsOptional() @IsUUID() sprintId?: string;
  @IsOptional() @IsUUID() parentIssueId?: string;
  @IsOptional() @IsISO8601() dueAt?: string;
  @IsOptional() @IsInt() originalEstimateSeconds?: number;
  @IsOptional() @IsIn(['Lowest', 'Low', 'Medium', 'High', 'Highest']) priority?: string;
  @IsOptional() @IsUUID() componentId?: string;
  @IsOptional() @IsUUID() fixVersionId?: string;
}

export class TransitionIssueDto {
  @IsString() @Length(1, 64) transitionKey!: string;
  @IsString() @Length(1, 64) expectedVersion!: string;
  @IsOptional() @IsString() @MaxLength(5000) comment?: string;
  @IsOptional() @IsString() @Length(8, 180) idempotencyKey?: string;
}

export class AddProjectMemberDto {
  @IsUUID() orgMemberId!: string;
}

export class UpdateProjectMemberStatusDto {
  @IsIn(['active', 'removed']) status!: 'active' | 'removed';
}

export class UpdateProjectDto {
  @IsString() @Length(1, 160) name!: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string | null;
  @IsOptional() @IsIn(['private', 'org', 'public']) visibility?: 'private' | 'org' | 'public';
  @IsOptional() @IsUUID() departmentId?: string | null;
}

export class CreateProjectRoleDto {
  @IsString() @Length(2, 64) key!: string;
  @IsString() @Length(1, 120) name!: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
}

export class AssignProjectRoleDto {
  @IsUUID() projectMemberId!: string;
  @IsUUID() projectRoleId!: string;
}

export class AssignProjectGroupRoleDto {
  @IsUUID() groupId!: string;
  @IsUUID() projectRoleId!: string;
}

export class CreateComponentDto {
  @IsString() @Length(1, 120) name!: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsUUID() leadMemberId?: string;
}

export class UpdateComponentDto extends CreateComponentDto {}

export class CreateVersionDto {
  @IsString() @Length(1, 160) name!: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsISO8601() releaseDate?: string;
}

export class UpdateVersionDto extends CreateVersionDto {}

export class SetPermissionSchemeDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => PermissionSchemeEntryDto) entries!: PermissionSchemeEntryDto[];
}

export class PermissionSchemeEntryDto {
  @IsString() @Length(1, 100) permissionKey!: string;
  @IsUUID() projectRoleId!: string;
}

export class UpdateIssueDto {
  @IsString() @Length(1, 64) expectedVersion!: string;
  @IsOptional() @IsString() @Length(1, 255) summary?: string;
  @IsOptional() @IsString() @MaxLength(10000) description?: string | null;
  @IsOptional() @IsUUID() assigneeMemberId?: string | null;
  @IsOptional() @IsUUID() sprintId?: string | null;
  @IsOptional() @IsUUID() parentIssueId?: string | null;
  @IsOptional() @IsISO8601() dueAt?: string | null;
  @IsOptional() @IsInt() originalEstimateSeconds?: number | null;
  @IsOptional() @IsInt() remainingEstimateSeconds?: number | null;
  @IsOptional() @IsIn(['Lowest', 'Low', 'Medium', 'High', 'Highest']) priority?: string;
  @IsOptional() @IsUUID() componentId?: string | null;
  @IsOptional() @IsUUID() fixVersionId?: string | null;
}
