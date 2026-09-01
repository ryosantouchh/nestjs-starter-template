import { Global, Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppLogger } from './logger';
import { randomUUID } from 'crypto';

@Global()
@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req, res) => {
          const existingId = req.headers['x-request-id'];
          if (existingId) {
            return existingId;
          }
          const id = randomUUID();
          req.headers['x-request-id'] = id;
          res.setHeader('x-request-id', id);
          return id;
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
