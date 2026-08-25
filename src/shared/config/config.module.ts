import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './app.config';
import { join } from 'path';

const isProduction = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: isProduction ? undefined : [join(process.cwd(), '.env')],
      ignoreEnvFile: isProduction,
      isGlobal: true,
      load: [appConfig],
    }),
  ],
})
export class AppConfigModule {}
