import type { IApiKeyRepository } from '@infra/repositories/api-key.repository';
import type { ILogger } from '@infra/logger/logger';

import { Inject } from '@nestjs/common';
import { randomBytes } from 'crypto';

import { ApiKey } from '@entities/api-key.entity';
import { StringPack } from '@shared/packs';

// ========== type ==========
export class GenerateApiKeyCommandPayloadDto {
  @StringPack()
  platform: string;
}

export class GenerateApiKeyCommandResponse {
  @StringPack()
  id: string;

  @StringPack()
  platform: string;

  @StringPack()
  key: string;
}

// ========== usecase ==========
export class GenerateApiKeyCommand {
  constructor(
    @Inject('ILogger') private readonly logger: ILogger,
    @Inject('IApiKeyRepository')
    private readonly apiKeyRepository: IApiKeyRepository,
  ) {}

  private mapResponse(createdApiKey: ApiKey): GenerateApiKeyCommandResponse {
    return {
      id: createdApiKey.id,
      platform: createdApiKey.platform,
      key: createdApiKey.key,
    };
  }

  async execute(
    payload: GenerateApiKeyCommandPayloadDto,
  ): Promise<GenerateApiKeyCommandResponse> {
    const secret = randomBytes(32).toString('hex');
    const newApiKey = this.apiKeyRepository.initialize({
      platform: payload.platform,
      key: secret,
    });
    const createdApiKey = await this.apiKeyRepository.save(newApiKey);

    return this.mapResponse(createdApiKey);
  }
}
