import { IsIn, IsObject, IsString, IsUUID, Length } from 'class-validator';

export class CreateGuardDto {
  @IsUUID() transitionId!: string;
  @IsIn(['requires_fields', 'json_logic', 'dsl', 'custom']) guardType!: 'requires_fields' | 'json_logic' | 'dsl' | 'custom';
  @IsObject() configJson!: Record<string, unknown>;
}

export class CreateWorkflowDto {
  @IsString() @Length(1, 64) key!: string;
  @IsString() @Length(1, 160) name!: string;
}
