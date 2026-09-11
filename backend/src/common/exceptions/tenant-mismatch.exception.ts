import { HttpStatus } from '@nestjs/common';
import { BusinessException } from './business-exception';
import { ERROR_CODES } from '../constants/error-codes';

export class TenantMismatchException extends BusinessException {
  constructor(message = 'Cross-tenant reference is not allowed') {
    super(ERROR_CODES.CROSS_TENANT_REFERENCE, message, HttpStatus.FORBIDDEN);
  }
}
