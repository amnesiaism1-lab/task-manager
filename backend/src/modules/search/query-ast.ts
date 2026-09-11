import { BadRequestException } from '@nestjs/common';
import { Brackets, SelectQueryBuilder } from 'typeorm';
import { Issue } from '../../database/entities/issue/issue.entity';

type Predicate = { field: 'q' | 'status' | 'assigneeMemberId' | 'issueTypeKey'; op?: 'eq' | 'contains'; value: string };
export type QueryAst = Predicate | { and: QueryAst[] } | { or: QueryAst[] } | { not: QueryAst };

export function applyQueryAst(query: SelectQueryBuilder<Issue>, astText?: string) {
  if (!astText) return query;
  let ast: QueryAst;
  try { ast = JSON.parse(astText) as QueryAst; } catch { throw new BadRequestException('queryAst must be valid JSON'); }
  if (!ast || typeof ast !== 'object') throw new BadRequestException('queryAst must be an object');
  query.andWhere(new Brackets((where) => appendNode(where, ast, 0)));
  return query;
}

function appendNode(where: any, node: QueryAst, depth: number, first = true, join: 'and' | 'or' = 'and'): void {
  if (depth > 5) throw new BadRequestException('queryAst is too deeply nested');
  if ('and' in node || 'or' in node) {
    const key = 'and' in node ? 'and' : 'or';
    const children = 'and' in node ? node.and : node.or;
    if (!Array.isArray(children) || children.length === 0 || children.length > 20) throw new BadRequestException(`${key} requires 1-20 children`);
    children.forEach((child, index) => appendNode(where, child, depth + 1, index === 0, key));
    return;
  }
  if ('not' in node) throw new BadRequestException('not predicates are not supported');
  if (!['q', 'status', 'assigneeMemberId', 'issueTypeKey'].includes(node.field) || typeof node.value !== 'string' || node.value.length > 500) throw new BadRequestException('Unsupported queryAst predicate');
  const parameter = `ast_${depth}_${Math.random().toString(36).slice(2, 8)}`;
  const expression = node.field === 'q' ? `(issue.summary ILIKE :${parameter} OR issue.key ILIKE :${parameter})` : node.field === 'status' ? `issue.state_id = :${parameter}` : node.field === 'assigneeMemberId' ? `issue.assignee_member_id = :${parameter}` : `issue.issue_type_id IN (SELECT id FROM issue_types WHERE key = :${parameter})`;
  const value = node.field === 'q' || node.op === 'contains' ? `%${node.value}%` : node.value;
  const method = first ? 'andWhere' : `${join}Where`;
  where[method](expression, { [parameter]: value });
}