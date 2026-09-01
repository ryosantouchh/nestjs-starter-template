import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { ApiKeyGuard } from '@infra/guards';

export function ApiKeyProtected() {
  return applyDecorators(UseGuards(ApiKeyGuard), ApiSecurity('x-api-key'));
}
