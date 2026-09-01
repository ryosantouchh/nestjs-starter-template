import type { Request } from 'express';
import { Injectable, PipeTransform, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { trace, context } from '@opentelemetry/api';

@Injectable()
export class AttachRequestIdPipe implements PipeTransform {
  constructor(@Inject(REQUEST) private readonly req: Request) {}

  transform(value: unknown) {
    const headers = this.req.headers;
    const requestId = headers['x-request-id'];

    const currentSpan = trace.getSpan(context.active());
    if (currentSpan) {
      currentSpan.setAttribute('http.request_id', requestId ?? '');
    }

    return value;
  }
}
