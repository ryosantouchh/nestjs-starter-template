import type { RmqContext } from '@nestjs/microservices';
import type { ILogger } from '@infra/logger/logger';
import { ConsumeMessage } from 'amqplib';

export function logReceivedMessage(
  logger: ILogger,
  pattern: string,
  payload: unknown,
  context: RmqContext,
) {
  const msg = context.getMessage() as ConsumeMessage;
  logger.info('Message received', {
    pattern,
    payload,
    routingKey: msg.fields?.routingKey,
    redelivered: msg.fields?.redelivered,
  });
}
