import type { RmqContext } from '@nestjs/microservices';
import type { Channel, ConsumeMessage } from 'amqplib';

export function getRmqChannelAndMessage(context: RmqContext): {
  channel: Channel;
  msg: ConsumeMessage;
} {
  return {
    channel: context.getChannelRef() as Channel,
    msg: context.getMessage() as ConsumeMessage,
  };
}
