import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { CreateUserCommand } from './command/create-user.command';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@entities/user.entity';
import { TypeOrmUserRepository } from '@infra/repositories';
import { FindUsersQuery } from './query/find-users.query';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    { provide: 'IUserRepository', useClass: TypeOrmUserRepository },

    // usecases
    CreateUserCommand,
    FindUsersQuery,
  ],
})
export class UserModule {}
