import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@entities/user.entity';
import { TypeOrmUserRepository } from '@infra/repositories';
import { SignInCommand } from './command/sign-in.command';
import { AuthController } from './auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [
    { provide: 'IUserRepository', useClass: TypeOrmUserRepository },
    SignInCommand,
  ],
})
export class AuthModule {}
