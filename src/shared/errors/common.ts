import { StatusCodes } from 'http-status-codes';

export interface ErrorObj {
  status: StatusCodes;
  message: string;
  code?: string;
  context?: unknown;
}

export class BaseError extends Error {
  public readonly status: StatusCodes;
  public readonly code?: string;
  public readonly context?: unknown;

  constructor(
    status: StatusCodes,
    message: string,
    code?: string,
    context?: unknown,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.context = context;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public toJSON(): ErrorObj {
    return {
      status: this.status,
      code: this.code,
      message: this.message,
      context: this.context,
    };
  }
}
