import { IsInt, IsISO8601, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString() @MinLength(1) @MaxLength(10000) body!: string;
  @IsOptional() @IsUUID() parentCommentId?: string;
}

export class CreateWorkLogDto {
  @IsOptional() @IsInt() @Min(1) @Max(864000) timeSpentSeconds?: number;
  @IsOptional() @IsInt() @Min(1) @Max(14400) timeSpentMinutes?: number;
  @IsISO8601() startedAt!: string;
  @IsOptional() @IsString() @MaxLength(5000) comment?: string;
  @IsOptional() @IsString() @MaxLength(5000) description?: string;
}

export class AddLabelDto {
  @IsString() @MinLength(1) @MaxLength(120) name!: string;
}

export class AddWatcherDto {
  @IsUUID() memberId!: string;
}

export class CreateIssueLinkDto {
  @IsUUID() linkedIssueId!: string;
  @IsUUID() linkTypeId!: string;
}
