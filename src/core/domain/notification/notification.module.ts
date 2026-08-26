import { Module } from '@nestjs/common';
import { NotificationConsumer } from './notification.consumer';
import { SendEmailTask } from './tasks/send-email.task';
import { NotificationService } from '@infra/service/external/notification.service';

@Module({
  controllers: [NotificationConsumer],
  providers: [
    { provide: 'INotificationService', useClass: NotificationService },

    // task
    SendEmailTask,
  ],
})
export class NotificationModule {}
