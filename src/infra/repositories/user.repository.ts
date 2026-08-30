import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '@entities/user.entity';
import { isEmpty } from 'lodash';
import type {
  IPaginatedResult,
  IPaginationQuery,
} from '@shared/types/pagination.type';
import { buildPaginationMetadata } from '@shared/utils';

export interface IUserRepository {
  findAll(
    filters?: IUserRepoAddFilter,
    relations?: IUserRepoAddRelation,
    pagination?: IPaginationQuery,
  ): Promise<IUserRepoFindAll>;
  findById(id: string): Promise<User | null>;
  findByName(name: string): Promise<User | null>;
  findByUsername(name: string): Promise<User | null>;
  save(user: Partial<User>): Promise<User>;
  initialize(input: Partial<User>): User;
}

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  async findAll(
    filters?: IUserRepoAddFilter,
    relations?: IUserRepoAddRelation,
    pagination?: IPaginationQuery,
  ) {
    const qb = this.repo.createQueryBuilder(`user`);

    this.addRelations(qb, relations);
    this.addFilter(qb, filters, relations);
    const { page, limit } = this.addPagination(qb, pagination);

    const [users, totalItems] = await qb.getManyAndCount();

    return {
      data: users,
      pagination: buildPaginationMetadata(totalItems, page, limit),
    };
  }

  async findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async findByName(name: string) {
    const qb = this.repo
      .createQueryBuilder(`user`)
      .where('user.name = :name', { name });

    return qb.getOne();
  }

  async findByUsername(username: string) {
    return this.repo.findOne({ where: { username } });
  }

  async save(user: User): Promise<User> {
    return this.repo.save(user);
  }

  initialize(input: Partial<User>): User {
    return this.repo.create(input);
  }

  private addRelations(
    qb: SelectQueryBuilder<User>,
    relations?: IUserRepoAddRelation,
  ) {
    if (isEmpty(relations)) {
      return;
    }

    // if (relations?.anotherTable) {
    //   qb.leftJoinAndSelect(`user.anotherTable`, `another_table`)
    // }
  }

  private addFilter(
    qb: SelectQueryBuilder<User>,
    filters?: IUserRepoAddFilter,
    relations?: IUserRepoAddRelation,
  ) {
    if (isEmpty(filters)) {
      return;
    }

    if (filters.ids) {
      qb.andWhere(`user.id IN (:...ids)`, { ids: filters.ids });
    }

    /* NOTE: if you need to do the where clause across the table, please guard check on relations first
     * if (relations?.anotherTable) {
     *   if (filter?.columnOfAnotherTable) {
     *     qb.andWhere(`another_table.columnOfAnotherTable = :value`, { value: ... })
     *   }
     * }
     */
  }

  private addPagination(
    qb: SelectQueryBuilder<User>,
    pagination?: IPaginationQuery,
  ): { page: number; limit: number } {
    const page = Math.max(1, pagination?.page ?? 1);
    const limit = Math.max(1, Math.min(pagination?.limit ?? 10, 100));
    const skip = (page - 1) * limit;

    qb.skip(skip).take(limit);

    return { page, limit };
  }
}

// ----- type -----
export interface IUserRepoAddFilter {
  ids?: Array<string>;
}

export interface IUserRepoAddRelation {
  anotherTable?: boolean;
}

export interface IUserRepoPagination {
  page?: number;
  limit?: number;
}

export type IUserRepoFindAll = IPaginatedResult<User>;
