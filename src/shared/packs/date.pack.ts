import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsDateString, IsOptional, ValidateIf } from 'class-validator';

export function DatePack(opt?: {
  apiPropertyOptions?: ApiPropertyOptions;
  options?: { optional?: boolean; nullable?: boolean };
}) {
  const { apiPropertyOptions, options } = opt ?? {};

  const decorators = [
    ApiProperty({
      type: String,
      format: 'date-time',
      example: '2026-08-25T13:18:54.784Z',
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

  decorators.push(IsDateString());

  return applyDecorators(...decorators);
}
