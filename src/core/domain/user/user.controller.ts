import { Controller, Get, Post, Body } from '@nestjs/common';
import {
  CreateUserCommand,
  CreateUserCommandPayloadDto,
} from '@domain/user/command/create-user.command';
import { ApiKeyProtected } from '@shared/decorators/api-key-protected.decorator';
import {
  FindUsersQuery,
  FindUsersQueryResponse,
} from './query/find-users.query';
import { ApiOkResponse } from '@nestjs/swagger';
import { JwtProtected } from '@shared/decorators';

@Controller({ path: 'v1/users' })
export class UserController {
  constructor(
    private readonly createUserCommand: CreateUserCommand,
    private readonly findUsersQuery: FindUsersQuery,
  ) {}

  @Post()
  @ApiKeyProtected()
  async createUser(@Body() body: CreateUserCommandPayloadDto) {
    return this.createUserCommand.execute(body);
  }

  @Get()
  @JwtProtected()
  @ApiOkResponse({ type: FindUsersQueryResponse })
  async getUsers(): Promise<FindUsersQueryResponse> {
    return this.findUsersQuery.execute();
  }
}
