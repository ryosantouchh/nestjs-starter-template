import { StatusCodes } from 'http-status-codes';
import { BaseError } from './common';

export class UnauthorizedApiKeyException extends BaseError {
  constructor(body: { message: string; code?: string; context?: unknown }) {
    super(StatusCodes.UNAUTHORIZED, body.message, body.code, body.context);
    this.name = 'UnauthorizedApiKeyException';
  }
}

export class NotFoundException extends BaseError {
  constructor(body: { message: string; code?: string; context?: unknown }) {
    super(StatusCodes.NOT_FOUND, body.message, body.code, body.context);
    this.name = 'NotFoundException';
  }
}

export class ConflictException extends BaseError {
  constructor(body: { message: string; code?: string; context?: unknown }) {
    super(StatusCodes.CONFLICT, body.message, body.code, body.context);
    this.name = 'ConflictException';
  }
}
