import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from '@entities/api-key.entity';
import { GenerateApiKeyCommand } from './command/generate-api-key.command';
import { TypeOrmApiKeyRepository } from '@infra/repositories';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ApiKey])],
  providers: [
    { provide: 'IApiKeyRepository', useClass: TypeOrmApiKeyRepository },
    GenerateApiKeyCommand,
  ],
  exports: ['IApiKeyRepository'],
})
export class ApiKeyModule {}
