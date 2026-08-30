import { Inject, Injectable } from '@nestjs/common';
import type { IUserRepository } from '@infra/repositories/user.repository';
import type { ILogger } from '@infra/logger/logger';
import { User } from '@entities/user.entity';
import { ArrayPack, StringPack } from '@shared/packs';
import { PaginatedResponse } from '@shared/common/pagination';

export class FindUsersQueryItem {
  @StringPack()
  id: string;

  @StringPack({ options: { nullable: true } })
  name: string | null;
}

export class FindUsersQueryResponse extends PaginatedResponse {
  @ArrayPack(FindUsersQueryItem)
  data: Array<FindUsersQueryItem>;
}

@Injectable()
export class FindUsersQuery {
  constructor(
    @Inject('ILogger') private readonly logger: ILogger,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  private mapResponse(users: Array<User>): Array<FindUsersQueryItem> {
    return users.length > 0
      ? users.map((item) => {
          return { id: item.id, name: item.name };
        })
      : [];
  }

  async execute(): Promise<FindUsersQueryResponse> {
    const { data: users, pagination } = await this.userRepository.findAll();

    const data = this.mapResponse(users);

    return {
      data,
      pagination,
    };
  }
}
