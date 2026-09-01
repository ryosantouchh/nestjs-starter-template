import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import type { ILogger } from '@infra/logger/logger';
import { RoutingKey } from './routing-key';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class EventPublisher {
  constructor(
    private readonly moduleRef: ModuleRef,
    @Inject('ILogger') private readonly logger: ILogger,
  ) {}

  publish(routingKey: RoutingKey, payload: Record<string, unknown>) {
    const client = this.moduleRef.get<ClientProxy>(
      `RABBITMQ_CLIENT_${routingKey}`,
      { strict: false },
    );
    this.logger.info('Publishing event', { routingKey, payload });
    client.emit(routingKey, payload);
  }
}
