import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

export interface ILogger {
  info(message: string, context?: Record<string, unknown>): void;
  error(
    message: string,
    error?: unknown,
    context?: Record<string, unknown>,
  ): void;
  warn(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}

@Injectable()
export class AppLogger implements ILogger {
  constructor(private readonly logger: PinoLogger) {}

  info(message: string, context?: Record<string, unknown>) {
    this.logger.info(context, message);
  }
  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    this.logger.error({ ...context, err: error }, message);
  }
  warn(message: string, context?: Record<string, unknown>) {
    this.logger.warn(context, message);
  }
  debug(message: string, context?: Record<string, unknown>) {
    this.logger.debug(context, message);
  }
}
