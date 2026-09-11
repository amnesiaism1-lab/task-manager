import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const IDEMPOTENCY_HEADER = 'x-idempotency-key';

/**
 * Extract idempotency key from request header.
 * Required for transition and other commands per REL-01/REL-02.
 */
export const IdempotencyKey = createParamDecorator(
  (required: boolean = false, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const key = request.headers[IDEMPOTENCY_HEADER];
    if (required && !key) {
      throw new BadRequestException('Idempotency key is required');
    }
    return key || null;
  },
);
