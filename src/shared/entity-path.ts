import { join } from 'path';

export const ENTITY_GLOB = join(
  __dirname,
  '../core/entities/**/*.entity{.ts,.js}',
);
export const MIGRATION_GLOB = join(
  __dirname,
  '../infra/database/migrations/*{.ts,.js}',
);
