import { HttpStatus } from '@nestjs/common';
import { BusinessException } from './business-exception';
import { ERROR_CODES } from '../constants/error-codes';

export class StaleVersionException extends BusinessException {
  constructor(currentVersion?: number) {
    super(
      ERROR_CODES.STALE_VERSION,
      'The resource has been modified. Please refresh and try again.',
      HttpStatus.CONFLICT,
      currentVersion !== undefined ? { currentVersion } : undefined,
    );
  }
}
