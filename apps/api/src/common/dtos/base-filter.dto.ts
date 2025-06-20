import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUppercase, Max, Min } from 'class-validator';

import { SORT_ORDER } from '../constants/order.constant';

export class BaseFilterDto {
  @ApiPropertyOptional({ description: 'Current page', minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1, maximum: 100, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;
  get skip() {
    return ((this.page || 1) - 1) * (this.limit || 10);
  }

  @ApiPropertyOptional({ description: 'Keyword' })
  @IsOptional()
  q?: string = '';

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  sort?: string = '';

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: SORT_ORDER,
    example: SORT_ORDER.DESC,
    default: SORT_ORDER.DESC,
  })
  @IsEnum(SORT_ORDER)
  @IsUppercase()
  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  order?: SORT_ORDER;
}
