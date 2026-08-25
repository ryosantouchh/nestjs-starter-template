import type { IApiKeyRepository } from '@infra/repositories/api-key.repository';
import type { ILogger } from '@infra/logger/logger';

import { Inject } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { IsNotEmpty, IsString } from 'class-validator';

import { ApiKey } from '@entities/api-key.entity';

// ========== type ==========
export class GenerateApiKeyCommandPayloadDto {
  @IsString()
  @IsNotEmpty()
  platform: string;
}

export type GenerateApiKeyCommandResponse = {
  id: string;
  platform: string;
  key: string;
};

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
