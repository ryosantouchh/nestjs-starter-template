import { Global, Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppLogger } from './logger';
import { randomUUID } from 'crypto';

@Global()
@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req, _res) => {
          const requestId = req.headers['x-request-id'] ?? randomUUID();
          req.headers['x-request-id'] = requestId;

          const clientActionId = req.headers['x-client-action-id'];

          if (clientActionId) {
            req.headers['x-client-action-id'] = clientActionId;
          }

          return {
            requestId,
            clientActionId: clientActionId ?? undefined,
          };
        },
        level: process.env.LOG_LEVEL || 'info',
        autoLogging: false,
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
      },
    }),
  ],
  providers: [{ provide: 'ILogger', useClass: AppLogger }],
  exports: ['ILogger'],
})
export class AppLoggerModule {}
