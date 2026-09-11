import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class IssueSearchDto extends PaginationDto {
  @IsOptional() @IsString() @MaxLength(64) projectId?: string;
  @IsOptional() @IsString() @MaxLength(500) q?: string;
  @IsOptional() @IsString() @MaxLength(64) status?: string;
  @IsOptional() @IsString() @MaxLength(64) assigneeMemberId?: string;
  @IsOptional() @IsString() @MaxLength(64) issueTypeKey?: string;
  @IsOptional() @IsString() @MaxLength(12000) queryAst?: string;
}
