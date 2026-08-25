import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export function SplitStringToArrayPack(opt?: {
  apiPropertyOptions?: ApiPropertyOptions;
  options?: { optional?: boolean; separator?: string };
}) {
  const { apiPropertyOptions, options } = opt ?? {};
  const separator = options?.separator ?? ',';

  const decorators = [
    ApiProperty({
      type: [String],
      required: !options?.optional,
      example: `a${separator}b${separator}c`,
      ...apiPropertyOptions,
    } as ApiPropertyOptions),
    Transform(({ value }: TransformFnParams): unknown => {
      if (value === undefined || value === null) {
        return value;
      }

      if (Array.isArray(value)) {
        return value;
      }

      if (typeof value !== 'string') {
        return value;
      }

      return value
        .split(separator)
        .map((v: string) => v.trim())
        .filter((v: string) => v.length > 0);
    }),
    IsArray(),
    IsString({ each: true }),
  ];

  if (options?.optional) {
    decorators.push(IsOptional());
  }

  return applyDecorators(...decorators);
}
