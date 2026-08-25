import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@entities/user.entity';

export interface IUserRepository {
  findAll(): Promise<Array<User>>;
  findById(id: string): Promise<User | null>;
  findByName(name: string): Promise<User | null>;
  findByUsername(name: string): Promise<User | null>;
  save(user: User): Promise<User>;
  initialize(input: Partial<User>): User;
}

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  async findAll() {
    return this.repo.find();
  }

  async findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async findByName(name: string) {
    return this.repo.findOne({ where: { name } });
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
}
