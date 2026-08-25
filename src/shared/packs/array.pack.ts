import { applyDecorators, Type as NestType } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import {
  IsArray,
  IsOptional,
  IsNumber,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

type ArrayElementType<T> =
  NestType<T> | StringConstructor | NumberConstructor | BooleanConstructor;

const PRIMITIVE_CONSTRUCTORS: readonly unknown[] = [String, Number, Boolean];

export function ArrayPack<T>(
  classType: ArrayElementType<T>,
  opt?: {
    apiPropertyOptions?: ApiPropertyOptions;
    options?: { optional?: boolean; nullable?: boolean };
  },
) {
  const { apiPropertyOptions, options } = opt ?? {};
  const isPrimitive = PRIMITIVE_CONSTRUCTORS.includes(classType);

  const decorators = [
    ApiProperty({
      type: [classType],
      required: !options?.optional,
      nullable: options?.nullable,
      ...apiPropertyOptions,
    } as ApiPropertyOptions),
  ];

  if (!isPrimitive) {
    decorators.push(Type(() => classType as NestType<T>));
  }

  const applyCoreValidators = () => {
    decorators.push(IsArray());
    if (classType === String) {
      decorators.push(IsString({ each: true }));
    } else if (classType === Number) {
      decorators.push(IsNumber({}, { each: true }));
    } else if (!isPrimitive) {
      decorators.push(ValidateNested({ each: true }));
    }
  };

  if (options?.optional) {
    decorators.push(IsOptional());
  } else if (options?.nullable) {
    decorators.push(ValidateIf((_, value) => value !== null));
    applyCoreValidators();
  } else {
    applyCoreValidators();
  }

  return applyDecorators(...decorators);
}
