import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Add correlation/request ID to every request.
 * Per SRS NFR-OBS-01: every P0 command must have correlation ID.
 */
@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const correlationId = request.headers['x-correlation-id'] || uuidv4();
    request.correlationId = correlationId;

    const response = context.switchToHttp().getResponse();
    response.setHeader('x-correlation-id', correlationId);

    return next.handle();
  }
}
