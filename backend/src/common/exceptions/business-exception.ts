import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base business exception with stable error code.
 * Per SRS §7.1: responses include stable business error code.
 */
export class BusinessException extends HttpException {
  public readonly errorCode: string;

  constructor(
    errorCode: string,
    message: string,
    status: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY,
    details?: Record<string, any>,
  ) {
    super(
      {
        statusCode: status,
        errorCode,
        message,
        ...(details && { details }),
        timestamp: new Date().toISOString(),
      },
      status,
    );
    this.errorCode = errorCode;
  }
}
