import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppConfigModule } from '@shared/config/config.module';
import { DatabaseModule } from '@infra/database/database.module';
import { AppLoggerModule } from '@infra/logger/logger.module';
import { GlobalExceptionFilter } from '@infra/filters/global-exception-filter';
import { UserModule } from './user/user.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { HealthModule } from '@infra/health/health.module';
import { AppJwtModule } from '@infra/jwt/jwt.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    HealthModule,
    AppLoggerModule,
    AppConfigModule,
    AppJwtModule,
    DatabaseModule,
    ApiKeyModule,
    UserModule,
    AuthModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: GlobalExceptionFilter }],
})
export class AppModule {}
