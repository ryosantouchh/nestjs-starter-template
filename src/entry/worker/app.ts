import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { WorkerModule } from '@domain/worker.module';
import { ROUTING_KEYS } from '@infra/rabbitmq/routing-key';
import { ILogger } from '@infra/logger/logger';
import { setupQueueBindings } from '@infra/rabbitmq/queue-setup';

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);
  const appLogger = app.get<ILogger>('ILogger');

  const exchange = configService.getOrThrow<string>('rabbitmq.exchange');
  const queue = configService.getOrThrow<string>('rabbitmq.queue');
  const deadLetterExchange = configService.getOrThrow<string>(
    'rabbitmq.deadLetterExchange',
  );
  const deadLetterQueue = configService.getOrThrow<string>(
    'rabbitmq.deadLetterQueue',
  );

  await setupQueueBindings({
    url: configService.getOrThrow<string>('rabbitmq.url'),
    exchange,
    queue,
    routingKeys: ROUTING_KEYS,
    deadLetterExchange,
    deadLetterQueue,
    logger: appLogger,
  });
  appLogger.info('Worker routing configuration', {
    exchange,
    queue,
    boundRoutingKeys: ROUTING_KEYS,
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.getOrThrow<string>('rabbitmq.url')],
      exchange,
      exchangeType: configService.getOrThrow<
        'direct' | 'topic' | 'fanout' | 'headers'
      >('rabbitmq.exchangeType'),
      queue,
      queueOptions: {
        durable: true,
        arguments: { 'x-dead-letter-exchange': deadLetterExchange },
      },
      noAck: false,
      prefetch: 1,
    },
  });
  app.enableShutdownHooks();
  await app.startAllMicroservices();
  await app.listen(process.env.WORKER_PORT ?? 3001);
}

bootstrap().catch((err) => {
  console.error('Fatal error during worker bootstrap', err);
  process.exit(1);
});
