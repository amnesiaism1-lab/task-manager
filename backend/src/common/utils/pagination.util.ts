import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PaginatedResult, PaginationDto } from '../dto/pagination.dto';

export async function paginate<T extends ObjectLiteral>(query: SelectQueryBuilder<T>, pagination: PaginationDto) {
  const [data, total] = await query.skip(pagination.skip).take(pagination.limit).getManyAndCount();
  return new PaginatedResult(data, total, pagination.page, pagination.limit);
}
