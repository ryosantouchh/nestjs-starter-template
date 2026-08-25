import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
} from '@nestjs/common';
import type { IApiKeyRepository } from '@infra/repositories/api-key.repository';
import { timingSafeEqual } from 'crypto';
import { UnauthorizedApiKeyException } from '@shared/errors';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    @Inject('IApiKeyRepository')
    private readonly apiKeyRepository: IApiKeyRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const providedKey = request.headers['x-api-key'];

    if (!providedKey || typeof providedKey !== 'string') {
      throw new UnauthorizedApiKeyException({
        message: 'Missing API key',
        code: 'E401001',
      });
    }

    const record = await this.apiKeyRepository.findByKey(providedKey);

    if (!record || !this.isValidKey(providedKey, record.key)) {
      throw new UnauthorizedApiKeyException({ message: 'Invalid API key' });
    }

    return true;
  }

  private isValidKey(provided: string, expected: string): boolean {
    const providedBuf = Buffer.from(provided);
    const expectedBuf = Buffer.from(expected);
    if (providedBuf.length !== expectedBuf.length) return false;
    return timingSafeEqual(providedBuf, expectedBuf);
  }
}
