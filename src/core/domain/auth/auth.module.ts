import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@entities/user.entity';
import { TypeOrmUserRepository } from '@infra/repositories';
import { SignInCommand } from './command/sign-in.command';
import { AuthController } from './auth.controller';
import { SignUpCommand } from './command/sign-up.command';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [
    { provide: 'IUserRepository', useClass: TypeOrmUserRepository },

    // usecases
    SignInCommand,
    SignUpCommand,
  ],
})
export class AuthModule {}
