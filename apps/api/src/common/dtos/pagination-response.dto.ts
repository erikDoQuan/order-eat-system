import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

import { PaginationDto } from './pagination.dto';

export class PaginationMetaDto {
  @ApiProperty({ type: () => PaginationDto })
  paging: PaginationDto;
}

export class PaginationResponseDto<T> {
  @IsArray()
  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty({ type: () => PaginationMetaDto })
  meta: {
    paging: PaginationDto;
  };

  constructor(
    data: T[],
    meta: {
      paging: PaginationDto;
    },
  ) {
    this.data = data;
    this.meta = meta;
  }
}
