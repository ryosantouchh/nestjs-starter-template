import type { IUserRepository } from '@infra/repositories/user.repository';
import type { ILogger } from '@infra/logger/logger';

import { Inject, Injectable } from '@nestjs/common';
import { NotFoundException } from '@shared/errors';
import { StringPack } from '@shared/packs';
import { EventPublisher } from '@infra/rabbitmq/event-publisher.service';
import { EmailTemplateEnum } from '@shared/constants';
import { RoutingKeysEnum } from '@infra/rabbitmq/routing-key';

export class SignUpDto {
  @StringPack()
  username: string;

  @StringPack()
  password: string;
}

@Injectable()
export class SignUpCommand {
  constructor(
    @Inject('ILogger') private readonly logger: ILogger,
    private readonly eventPublisher: EventPublisher,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async execute(payload: SignUpDto): Promise<void> {
    const user = await this.userRepository.save({
      username: payload.username,
      password: payload.password,
    });

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
      });
    }

    this.eventPublisher.publish(RoutingKeysEnum.NOTIFICATION_SEND_EMAIL, {
      email: 'example@mail.com',
      template: EmailTemplateEnum.WELCOME,
      data: { name: 'test' },
    });
  }
}
