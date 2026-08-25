import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

type StringPackOptions = {
  nullable?: boolean;
  optional?: boolean;
};

export function StringPack(opt?: {
  apiPropertyOptions?: ApiPropertyOptions;
  options?: StringPackOptions;
}) {
  const { apiPropertyOptions, options } = opt ?? {};

  const decorators = [
    IsString(),
    ApiProperty({
      type: String,
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
