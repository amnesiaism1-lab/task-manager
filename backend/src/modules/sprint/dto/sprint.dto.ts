import { IsOptional, IsString, IsUUID, Length, MaxLength } from 'class-validator';

export class CreateSprintDto {
  @IsString() @Length(1, 160) name!: string;
  @IsOptional() @IsString() @MaxLength(2000) goal?: string;
}

export class AssignIssueDto {
  @IsUUID() issueId!: string;
}
