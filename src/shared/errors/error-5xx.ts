import { StatusCodes } from 'http-status-codes';
import { BaseError } from './common';

export class InternalServerException extends BaseError {
  constructor(body: { message: string; code?: string; context?: unknown }) {
    super(
      StatusCodes.INTERNAL_SERVER_ERROR,
      body.message,
      body.code,
      body.context,
    );
    this.name = 'InternalServerException';
  }
}

export class EnvironmentVariableUndetectedException extends BaseError {
  constructor(body: { message: string; code?: string; context?: unknown }) {
    super(
      StatusCodes.INTERNAL_SERVER_ERROR,
      body.message,
      body.code,
      body.context,
    );
    this.name = 'EnvironmentVariableUndetected';
  }
}
