import type { IUserRepository } from '@infra/repositories/user.repository';
import type { ILogger } from '@infra/logger/logger';

import { Inject } from '@nestjs/common';

import { User } from '@entities/user.entity';
import { IsNotEmpty, IsString } from 'class-validator';
import { ConflictException } from '@shared/errors';

// ========== type ==========
export class CreateUserCommandPayloadDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export type CreateUserCommandResponse = {
  id: string;
  name: string | null;
};

// ========== usecase ==========
export class CreateUserCommand {
  constructor(
    @Inject('ILogger') private readonly logger: ILogger,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  private mapResponse(createdUser: User): CreateUserCommandResponse {
    return {
      id: createdUser.id,
      name: createdUser.name,
    };
  }

  async execute(
    payload: CreateUserCommandPayloadDto,
  ): Promise<CreateUserCommandResponse> {
    const existUser = await this.userRepository.findByName(payload.name);

    if (existUser) {
      throw new ConflictException({
        message: `User with name "${payload.name}" already exists`,
      });
    }

    this.logger.info(`CreateUserCommand.execute start save user to database`, {
      payload,
    });
    const newUser = this.userRepository.initialize(payload);
    const createdUser = await this.userRepository.save(newUser);

    this.logger.info(`CreateUserCommand.execute finish save user to database`, {
      createdUser,
    });

    return this.mapResponse(createdUser);
  }
}
