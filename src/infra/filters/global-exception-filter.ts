import { ExceptionFilter, Catch, ArgumentsHost, Inject } from '@nestjs/common';
import { Response } from 'express';
import { BaseError } from '@shared/errors/common';
import type { ILogger } from '@infra/logger/logger';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(@Inject('ILogger') private readonly logger: ILogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof BaseError) {
      this.logger.error(exception.message, exception, {
        code: exception.code,
        status: exception.status,
      });
      return response.status(exception.status).json(exception.toJSON());
    }

    this.logger.error('Unhandled exception', exception);
    return response.status(500).json({
      status: 500,
      message: 'Internal server error',
    });
  }
}
