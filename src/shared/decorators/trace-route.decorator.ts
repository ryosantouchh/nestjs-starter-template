import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { TraceRequestId } from './trace-request-id.decorator';
import { TraceRequestIdInterceptor } from '@infra/interceptors';

export function TraceRoute() {
  return applyDecorators(
    TraceRequestId(),
    UseInterceptors(TraceRequestIdInterceptor),
  );
}
