import { HttpStatus } from '@nestjs/common';
import { BusinessException } from './business-exception';
import { ERROR_CODES } from '../constants/error-codes';

export class IdempotencyConflictException extends BusinessException {
  constructor() {
    super(
      ERROR_CODES.IDEMPOTENCY_CONFLICT,
      'This operation has already been processed.',
      HttpStatus.CONFLICT,
    );
  }
}
