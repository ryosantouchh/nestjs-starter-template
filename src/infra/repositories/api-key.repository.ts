import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '@entities/api-key.entity';

export interface IApiKeyRepository {
  findByKey(key: string): Promise<ApiKey | null>;
  save(user: ApiKey): Promise<ApiKey>;
  initialize(input: Partial<ApiKey>): ApiKey;
}

@Injectable()
export class TypeOrmApiKeyRepository implements IApiKeyRepository {
  constructor(
    @InjectRepository(ApiKey) private readonly repo: Repository<ApiKey>,
  ) {}

  async findByKey(key: string) {
    return this.repo.findOne({ where: { key } });
  }

  async save(newInput: ApiKey): Promise<ApiKey> {
    return this.repo.save(newInput);
  }

  initialize(input: Partial<ApiKey>): ApiKey {
    return this.repo.create(input);
  }
}
