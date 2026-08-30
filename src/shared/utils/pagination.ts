import { PaginationMetadata } from '@shared/common/pagination';

export function buildPaginationMetadata(
  totalItems: number,
  page: number,
  limit: number,
): PaginationMetadata {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  return {
    totalItems,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
