import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsNumber, IsOptional, ValidateIf } from 'class-validator';

export function NumberPack(opt?: {
  apiPropertyOptions?: ApiPropertyOptions;
  options?: { optional?: boolean; nullable?: boolean };
}) {
  const { apiPropertyOptions, options } = opt ?? {};

  const decorators = [
    ApiProperty({
      type: Number,
      required: !options?.optional,
      nullable: options?.nullable,
      ...apiPropertyOptions,
    } as ApiPropertyOptions),
  ];

  if (options?.optional) {
    decorators.push(IsOptional());
  } else if (options?.nullable) {
    decorators.push(ValidateIf((_, value) => value !== null));
  }

  decorators.push(IsNumber());

  return applyDecorators(...decorators);
}
