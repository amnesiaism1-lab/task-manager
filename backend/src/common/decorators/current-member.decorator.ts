import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extract current organization member context from request.
 * Set by OrgMembershipGuard after resolving membership.
 */
export const CurrentMember = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const member = request.orgMember;
    return data ? member?.[data] : member;
  },
);
