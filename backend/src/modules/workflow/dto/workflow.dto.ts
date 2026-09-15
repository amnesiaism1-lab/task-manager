import { IsBoolean, IsIn, IsInt, IsObject, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateGuardDto {
  @IsUUID() transitionId!: string;
  @IsIn(['requires_fields', 'json_logic', 'dsl', 'custom']) guardType!: 'requires_fields' | 'json_logic' | 'dsl' | 'custom';
  @IsObject() configJson!: Record<string, unknown>;
}

export class CreateWorkflowDto {
  @IsString() @Length(1, 64) key!: string;
  @IsString() @Length(1, 160) name!: string;
}

export class CreateStateDto {
  @IsString() @Length(1, 64) key!: string;
  @IsString() @Length(1, 120) name!: string;
  @IsIn(['todo', 'in_progress', 'done']) category!: 'todo' | 'in_progress' | 'done';
  @IsOptional() @IsBoolean() isInitial?: boolean;
  @IsOptional() @IsBoolean() isTerminal?: boolean;
  @IsOptional() @IsInt() position?: number;
}

export class UpdateStateDto {
  @IsOptional() @IsString() @Length(1, 64) key?: string;
  @IsOptional() @IsString() @Length(1, 120) name?: string;
  @IsOptional() @IsIn(['todo', 'in_progress', 'done']) category?: 'todo' | 'in_progress' | 'done';
  @IsOptional() @IsBoolean() isInitial?: boolean;
  @IsOptional() @IsBoolean() isTerminal?: boolean;
  @IsOptional() @IsInt() position?: number;
}

export class CreateTransitionDto {
  @IsString() @Length(1, 64) key!: string;
  @IsString() @Length(1, 120) name!: string;
  @IsUUID() fromStateId!: string;
  @IsUUID() toStateId!: string;
  @IsOptional() @IsBoolean() requireComment?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
}

export class UpdateTransitionDto {
  @IsOptional() @IsString() @Length(1, 64) key?: string;
  @IsOptional() @IsString() @Length(1, 120) name?: string;
  @IsOptional() @IsBoolean() requireComment?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
}
