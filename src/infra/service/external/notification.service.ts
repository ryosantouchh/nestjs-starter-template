import type { ILogger } from '@infra/logger/logger';
import type { IEmailTemplate } from '@shared/constants';
import { Inject, Injectable } from '@nestjs/common';
import { TEMPLATES } from '@shared/constants';

export interface INotificationService {
  sendEmail(params: SendEmailParams): Promise<void>;
}

@Injectable()
export class NotificationService implements INotificationService {
  constructor(@Inject('ILogger') private readonly logger: ILogger) {}

  async sendEmail(params: SendEmailParams): Promise<void> {
    const templateFn = TEMPLATES[params.template];

    if (!templateFn) {
      throw new Error(`Unknown email template: ${params.template}`);
    }

    const { subject, body } = templateFn(params.data);

    this.logger.info('MOCK: Sending email', { to: params.to, subject, body });

    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}
//
// ===== type =====
export interface SendEmailParams {
  to: string;
  template: IEmailTemplate;
  data: Record<string, unknown>;
}
