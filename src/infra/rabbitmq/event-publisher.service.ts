import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import type { ILogger } from '@infra/logger/logger';
import { RoutingKey } from './routing-key';

@Injectable()
export class EventPublisher {
  constructor(
    @Inject('RABBITMQ_EVENT_CLIENT') private readonly client: ClientProxy,
    @Inject('ILogger') private readonly logger: ILogger,
  ) {}

  publish<T>(routingKey: RoutingKey, payload: T | Record<string, unknown>) {
    this.logger.warn('Publishing event', { routingKey, payload });
    this.client.emit(routingKey, payload);
  }
}
