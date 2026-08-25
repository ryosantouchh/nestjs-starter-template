export const appConfig = () => ({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  database: {
    hostname: process.env.DATABASE_HOSTNAME || 'localhost',
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    databaseName: process.env.DATABASE_NAME || 'nestjs-starter-template-db',
    databasePort: process.env.DATABASE_PORT || '5432',
  },
});
