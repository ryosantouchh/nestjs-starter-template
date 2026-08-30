import { PaginationMetadata } from '@shared/common/pagination';

export interface IPaginationQuery {
  page?: number;
  limit?: number;
}

export interface IPaginatedResult<T> {
  data: Array<T>;
  pagination: PaginationMetadata;
}
