import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { getEnv } from '@shared/utils';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: getEnv('JWT_SECRET'),
    }),
  ],
  exports: [JwtModule],
})
export class AppJwtModule {}
