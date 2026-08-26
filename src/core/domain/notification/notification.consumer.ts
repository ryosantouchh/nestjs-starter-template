import type { ILogger } from '@infra/logger/logger';
import { Controller, Inject } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { getRmqChannelAndMessage } from '@infra/rabbitmq/rabbitmq-context.helper';
import { EventPublisher } from '@infra/rabbitmq/event-publisher.service';
import {
  SendEmailTask,
  SendEmailTaskPayloadDto,
} from './tasks/send-email.task';
import { logReceivedMessage } from '@infra/rabbitmq/rabbitmq-log.helper';
import { RoutingKeysEnum } from '@infra/rabbitmq/routing-key';

@Controller()
export class NotificationConsumer {
  constructor(
    private readonly sendEmailTask: SendEmailTask,
    private readonly eventPublisher: EventPublisher,
    @Inject('ILogger') private readonly logger: ILogger,
  ) {}

  @EventPattern(RoutingKeysEnum.NOTIFICATION_SEND_EMAIL)
  async handleSendEmail(
    @Payload() payload: SendEmailTaskPayloadDto,
    @Ctx() context: RmqContext,
  ) {
    logReceivedMessage(
      this.logger,
      RoutingKeysEnum.NOTIFICATION_SEND_EMAIL,
      payload,
      context,
    );

    const { channel, msg } = getRmqChannelAndMessage(context);

    try {
      await this.sendEmailTask.execute(payload);
      channel.ack(msg);
    } catch (error) {
      this.logger.error('Task failed', error);
      channel.nack(msg, false, false); // straight to DLQ, no retry logic at all
    }
  }
}
