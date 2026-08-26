import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { EventPublisher } from './event-publisher.service';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_EVENT_CLIENT',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>('rabbitmq.url')],
            exchange: configService.getOrThrow<string>('rabbitmq.exchange'),
            exchangeType: configService.getOrThrow<
              'direct' | 'topic' | 'fanout' | 'headers'
            >('rabbitmq.exchangeType'),
            queue: configService.getOrThrow<string>('rabbitmq.queue'),
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
      },
    ]),
  ],
  providers: [EventPublisher],
  exports: [ClientsModule, EventPublisher],
})
export class RabbitMQEventModule {}
