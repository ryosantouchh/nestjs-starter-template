import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export function EnumPack<T extends readonly string[]>(
  values: T,
  opt?: {
    apiPropertyOptions?: ApiPropertyOptions;
    options?: { optional?: boolean; nullable?: boolean };
  },
) {
  const { apiPropertyOptions, options } = opt ?? {};

  const decorators = [
    IsString(),
    IsIn(values),
    ApiProperty({
      enum: values,
      required: !options?.optional,
      nullable: options?.nullable,
      ...apiPropertyOptions,
    } as ApiPropertyOptions),
  ];

  if (options?.optional) {
    decorators.push(IsOptional());
  } else if (options?.nullable) {
    decorators.push(ValidateIf((_, value) => value !== null));
    decorators.push(IsNotEmpty());
  } else {
    decorators.push(IsNotEmpty());
  }

  return applyDecorators(...decorators);
}
