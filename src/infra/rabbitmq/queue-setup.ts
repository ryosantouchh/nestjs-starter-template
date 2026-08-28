import * as amqp from 'amqplib';
import type { ILogger } from '@infra/logger/logger';

export async function setupQueueBindings(params: {
  url: string;
  exchange: string;
  routingKeys: readonly string[];
  deadLetterExchange: string;
  logger: ILogger;
}) {
  const { url, exchange, routingKeys, deadLetterExchange, logger } = params;

  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();

  await channel.assertExchange(deadLetterExchange, 'fanout', { durable: true });
  await channel.assertExchange(exchange, 'direct', { durable: true });

  for (const key of routingKeys) {
    const queueName = routingKeyToQueueName(key);
    const dlqName = `${queueName}.dlq`;

    await channel.assertQueue(dlqName, { durable: true });
    await channel.bindQueue(dlqName, deadLetterExchange, '');

    await channel.assertQueue(queueName, {
      durable: true,
      arguments: { 'x-dead-letter-exchange': deadLetterExchange },
    });
    await channel.bindQueue(queueName, exchange, key);

    logger.info('Queue bound', {
      queueName,
      exchange,
      routingKey: key,
      dlqName,
    });
  }

  await channel.close();
  await connection.close();
}

export function routingKeyToQueueName(key: string): string {
  return key.replace(/\./g, '_').replace(/-/g, '_') + '_queue';
}
