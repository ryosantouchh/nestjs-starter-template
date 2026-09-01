import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { EventPublisher } from './event-publisher.service';
import { routingKeyToQueueName } from '@infra/rabbitmq/queue-setup';
import { ROUTING_KEYS } from '@infra/rabbitmq/routing-key';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync(
      ROUTING_KEYS.map((key) => ({
        name: `RABBITMQ_CLIENT_${key}`,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>('rabbitmq.url')],
            exchange: configService.getOrThrow<string>('rabbitmq.exchange'),
            exchangeType: configService.getOrThrow<
              'direct' | 'topic' | 'fanout' | 'headers'
            >('rabbitmq.exchangeType'),
            queue: routingKeyToQueueName(key),
            queueOptions: {
              durable: true,
              arguments: {
                'x-dead-letter-exchange': configService.getOrThrow<string>(
                  'rabbitmq.deadLetterExchange',
                ),
              },
            },
          },
        }),
      })),
    ),
  ],
  providers: [EventPublisher],
  exports: [ClientsModule, EventPublisher],
})
export class RabbitMQEventModule {}
