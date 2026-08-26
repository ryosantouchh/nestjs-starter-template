import type { ILogger } from '@infra/logger/logger';
import type { INotificationService } from '@infra/service/external/notification.service';
import type { IEmailTemplate } from '@shared/constants';

import { Injectable, Inject } from '@nestjs/common';
import { EMAIL_TEMPLATE_VALUES } from '@shared/constants';
import { EnumPack, ObjectPack, StringPack } from '@shared/packs';

// ========== type ==========
export class SendEmailTaskPayloadDto {
  @StringPack()
  email: string;

  @EnumPack(EMAIL_TEMPLATE_VALUES)
  template: IEmailTemplate;

  @ObjectPack()
  data: Record<string, unknown>;
}

@Injectable()
export class SendEmailTask {
  constructor(
    @Inject('ILogger') private readonly logger: ILogger,
    @Inject('INotificationService')
    private readonly notificationService: INotificationService,
  ) {}

  async execute(payload: SendEmailTaskPayloadDto): Promise<void> {
    this.logger.warn('SendEmailTask: Sending sign up email success', {
      email: payload.email,
      template: payload.template,
      data: payload.data,
    });

    await this.notificationService.sendEmail({
      to: payload.email,
      template: payload.template,
      data: payload.data,
    });
  }
}
