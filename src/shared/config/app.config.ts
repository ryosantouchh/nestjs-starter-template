export const appConfig = () => ({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  database: {
    hostname: process.env.DATABASE_HOSTNAME || 'localhost',
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    databaseName: process.env.DATABASE_NAME || 'nestjs-starter-template-db',
    databasePort: process.env.DATABASE_PORT || '5432',
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'domain_events',
    exchangeType: 'direct' as const,
    queue: process.env.RABBITMQ_WORKER_QUEUE || 'main_worker_queue',
    deadLetterExchange: process.env.RABBITMQ_DLX || 'domain_events.dlx',
    deadLetterQueue: process.env.RABBITMQ_DLQ || 'main_worker_queue.dlq',
  },
});
