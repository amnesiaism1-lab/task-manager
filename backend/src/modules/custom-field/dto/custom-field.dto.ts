import { IsBoolean, IsIn, IsInt, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreateCustomFieldDto {
  @IsString() @Length(1, 64) key!: string;
  @IsString() @Length(1, 120) name!: string;
  @IsIn(['text', 'number', 'date', 'select', 'user', 'json']) fieldType!: 'text' | 'number' | 'date' | 'select' | 'user' | 'json';
}

export class CreateContextDto {
  @IsUUID() projectId!: string;
  @IsUUID() issueTypeId!: string;
  @IsOptional() @IsBoolean() isRequired?: boolean;
  @IsOptional() @IsInt() @Min(0) position?: number;
}

export class CreateOptionDto {
  @IsString() @Length(1, 120) value!: string;
  @IsString() @Length(1, 160) label!: string;
  @IsOptional() @IsInt() @Min(0) position?: number;
}

export class SetValueDto {
  @IsUUID() contextId!: string;
  value!: unknown;
}
