import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateBoardDto {
  @IsString() @MinLength(1) @MaxLength(160) name!: string;
  @IsIn(['kanban', 'scrum']) boardType!: 'kanban' | 'scrum';
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
}

export class CreateColumnDto {
  @IsString() @MinLength(1) @MaxLength(120) name!: string;
  @IsOptional() @IsInt() @Min(0) @Max(100000) wipLimit?: number;
}

export class ReorderIssueDto {
  @IsUUID() issueId!: string;
  @IsOptional() @IsString() previousRank?: string;
  @IsOptional() @IsString() nextRank?: string;
}

export class UpdateColumnDto {
  @IsString() @MinLength(1) @MaxLength(120) name!: string;
  @IsOptional() @IsInt() @Min(0) @Max(100000) wipLimit?: number | null;
  @IsOptional() @IsInt() @Min(0) position?: number;
}

export class MapColumnStatesDto {
  @IsUUID('4', { each: true }) workflowStateIds!: string[];
}
