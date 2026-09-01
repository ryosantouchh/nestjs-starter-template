import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { WorkerModule } from '@domain/worker.module';
import { ROUTING_KEYS } from '@infra/rabbitmq/routing-key';
import { ILogger } from '@infra/logger/logger';
import {
  setupQueueBindings,
  routingKeyToQueueName,
} from '@infra/rabbitmq/queue-setup';

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);
  const appLogger = app.get<ILogger>('ILogger');

  const exchange = configService.getOrThrow<string>('rabbitmq.exchange');
  const exchangeType = configService.getOrThrow<
    'direct' | 'topic' | 'fanout' | 'headers'
  >('rabbitmq.exchangeType');
  const deadLetterExchange = configService.getOrThrow<string>(
    'rabbitmq.deadLetterExchange',
  );
  const url = configService.getOrThrow<string>('rabbitmq.url');

  await setupQueueBindings({
    url,
    exchange,
    routingKeys: ROUTING_KEYS,
    deadLetterExchange,
    logger: appLogger,
  });

  appLogger.info('Worker routing configuration', {
    exchange,
    boundQueues: ROUTING_KEYS.map(routingKeyToQueueName),
  });

  for (const key of ROUTING_KEYS) {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [url],
        exchange,
        exchangeType,
        queue: routingKeyToQueueName(key),
        queueOptions: {
          durable: true,
          arguments: { 'x-dead-letter-exchange': deadLetterExchange },
        },
        noAck: false,
        prefetchCount: 1,
      },
    });
  }

  app.enableShutdownHooks();
  await app.startAllMicroservices();
  await app.listen(process.env.WORKER_PORT ?? 3001);
}

bootstrap().catch((err) => {
  console.error('Fatal error during worker bootstrap', err);
  process.exit(1);
});
