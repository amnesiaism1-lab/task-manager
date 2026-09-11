import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Issue } from '../../database/entities/issue/issue.entity';

/**
 * Extract current verified issue context from request.
 * Set by IssuePermissionGuard after verifying access permissions.
 */
export const CurrentIssue = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): Issue | any => {
    const request = ctx.switchToHttp().getRequest();
    const issue = request.issue;
    return data ? issue?.[data] : issue;
  },
);
