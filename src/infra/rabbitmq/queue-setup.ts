import * as amqp from 'amqplib';
import type { ILogger } from '@infra/logger/logger';

export async function setupQueueBindings(params: {
  url: string;
  exchange: string;
  queue: string;
  routingKeys: readonly string[];
  deadLetterExchange: string;
  deadLetterQueue: string;
  logger: ILogger;
}) {
  const {
    url,
    exchange,
    queue,
    routingKeys,
    deadLetterExchange,
    deadLetterQueue,
    logger,
  } = params;

  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();

  await channel.assertExchange(deadLetterExchange, 'fanout', { durable: true });
  await channel.assertQueue(deadLetterQueue, { durable: true });
  await channel.bindQueue(deadLetterQueue, deadLetterExchange, '');
  logger.info('Dead-letter queue ready', {
    deadLetterQueue,
    deadLetterExchange,
  });

  await channel.assertExchange(exchange, 'direct', { durable: true });
  await channel.assertQueue(queue, {
    durable: true,
    arguments: { 'x-dead-letter-exchange': deadLetterExchange },
  });

  for (const key of routingKeys) {
    await channel.bindQueue(queue, exchange, key);
    logger.info('Queue bound to routing key', {
      queue,
      exchange,
      routingKey: key,
    });
  }

  logger.info('Queue bindings ready', {
    exchange,
    queue,
    routingKeys,
    deadLetterExchange,
    deadLetterQueue,
  });

  await channel.close();
  await connection.close();
}
