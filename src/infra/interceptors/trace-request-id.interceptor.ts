import type { Request } from 'express';

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { trace, context } from '@opentelemetry/api';
import { Observable } from 'rxjs';
import { TRACE_REQUEST_ID_KEY } from '@infra/decorators';

@Injectable()
export class TraceRequestIdInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const isTraced = this.reflector.get<boolean>(
      TRACE_REQUEST_ID_KEY,
      ctx.getHandler(),
    );

    if (isTraced) {
      const request = ctx.switchToHttp().getRequest<Request>();
      const requestId = request.headers['x-request-id'];

      const currentSpan = trace.getSpan(context.active());
      if (currentSpan) {
        currentSpan.setAttribute(
          'http.request_id',
          Array.isArray(requestId) ? requestId[0] : (requestId ?? ''),
        );
      }
    }

    return next.handle();
  }
}
