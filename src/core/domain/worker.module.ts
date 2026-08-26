import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { AppLoggerModule } from '@infra/logger/logger.module';
import { AppConfigModule } from '@shared/config/config.module';
import { DatabaseModule } from '@infra/database/database.module';
import { AppJwtModule } from '@infra/jwt/jwt.module';
import { RabbitMQEventModule } from '@infra/rabbitmq/rabbitmq.module';
import { NotificationModule } from './notification/notification.module';
import { GlobalExceptionFilter } from '@infra/filters/global-exception-filter';
import { HealthModule } from '@infra/health/health.module';

@Module({
  imports: [
    AppLoggerModule,
    AppConfigModule,
    DatabaseModule,
    AppJwtModule,
    RabbitMQEventModule,
    HealthModule,

    // worker domain
    NotificationModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: GlobalExceptionFilter }],
})
export class WorkerModule {}
