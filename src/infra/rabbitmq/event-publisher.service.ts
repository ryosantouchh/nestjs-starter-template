import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import type { ILogger } from '@infra/logger/logger';
import { ROUTING_KEYS, type RoutingKey } from './routing-key';
import { ModuleRef } from '@nestjs/core';
import { lastValueFrom } from 'rxjs';
import { context, propagation } from '@opentelemetry/api';
import { randomUUID } from 'crypto';

@Injectable()
export class EventPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly clients = new Map<RoutingKey, ClientProxy>();

  constructor(
    private readonly moduleRef: ModuleRef,
    @Inject('ILogger') private readonly logger: ILogger,
  ) {}

  onModuleInit() {
    for (const key of ROUTING_KEYS) {
      this.clients.set(
        key,
        this.moduleRef.get<ClientProxy>(`RABBITMQ_CLIENT_${key}`, {
          strict: false,
        }),
      );
    }
  }

  async onModuleDestroy() {
    await Promise.allSettled(
      [...this.clients.values()].map(async (client) => {
        await client.close();
      }),
    );
  }

  async publish(
    routingKey: RoutingKey,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const client = this.clients.get(routingKey);
    if (!client)
      throw new Error(`No client registered for routing key: ${routingKey}`);

    const headers: Record<string, string> = {};
    propagation.inject(context.active(), headers);

    const messageId = randomUUID();
    const record = new RmqRecordBuilder(payload)
      .setOptions({ headers, persistent: true, messageId })
      .build();

    this.logger.debug('Publishing event', { routingKey, messageId, payload });

    try {
      await lastValueFrom(client.emit(routingKey, record));
      this.logger.info('Published event', { routingKey, messageId });
    } catch (error) {
      this.logger.error('Publish failed', error, { routingKey, messageId });
      throw error;
    }
  }
}
