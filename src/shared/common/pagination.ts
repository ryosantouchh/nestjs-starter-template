import { ObjectPack, BooleanPack, NumberPack } from '@shared/packs';

export class PaginationMetadata {
  @NumberPack({
    apiPropertyOptions: { example: 100 },
    options: { optional: true },
  })
  totalCount?: number;

  @NumberPack({ apiPropertyOptions: { example: 100 } })
  totalItems: number;

  @NumberPack({ apiPropertyOptions: { example: 1 } })
  page: number;

  @NumberPack({ apiPropertyOptions: { example: 20 } })
  limit: number;

  @NumberPack({ apiPropertyOptions: { example: 5 } })
  totalPages: number;

  @BooleanPack({ apiPropertyOptions: { example: true } })
  hasNextPage: boolean;

  @BooleanPack({ apiPropertyOptions: { example: false } })
  hasPreviousPage: boolean;
}

export class PaginatedResponse {
  @ObjectPack(PaginationMetadata)
  metadata: PaginationMetadata;
}
