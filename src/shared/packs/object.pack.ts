import { applyDecorators, Type as NestType } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsOptional, ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export function ObjectPack<T>(
  classType: NestType<T>,
  opt?: {
    apiPropertyOptions?: ApiPropertyOptions;
    options?: { optional?: boolean; nullable?: boolean };
  },
) {
  const { apiPropertyOptions, options } = opt ?? {};

  const decorators = [
    ApiProperty({
      type: classType,
      required: !options?.optional,
      nullable: options?.nullable,
      ...apiPropertyOptions,
    } as ApiPropertyOptions),
    Type(() => classType),
  ];

  if (options?.optional) {
    decorators.push(IsOptional());
  } else if (options?.nullable) {
    decorators.push(ValidateIf((_, value) => value !== null));
    decorators.push(ValidateNested());
  } else {
    decorators.push(ValidateNested());
  }

  return applyDecorators(...decorators);
}
