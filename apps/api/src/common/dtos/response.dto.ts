import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class AbstractResponseDto {
  @ApiProperty({
    type: String,
    example: 'b232f987-56ab-4d3b-89e3-f92a396b7b08',
  })
  @IsUUID('4')
  id: string;

  @ApiProperty({
    type: Date,
    example: '2023-03-02T11:38:29.963Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2023-03-02T11:38:29.963Z',
  })
  updatedAt?: Date;

  @ApiProperty({
    type: String,
    example: 'b232f987-56ab-4d3b-89e3-f92a396b7b08',
  })
  @IsUUID('4')
  createdBy: string;

  @ApiPropertyOptional({
    type: String,
    example: 'b232f987-56ab-4d3b-89e3-f92a396b7b08',
  })
  @IsUUID('4')
  updatedBy?: string;

  @ApiPropertyOptional({
    example: true,
  })
  @IsBoolean()
  isActive?: string;
}

export class ResponseDataSerialization<T = Record<string, any>> {
  @ApiProperty({
    name: 'statusCode',
    type: Number,
    nullable: false,
    example: 200,
    description: 'Return specific status code for every endpoints',
  })
  readonly statusCode: number;

  @ApiProperty({
    name: 'message',
    nullable: false,
    type: String,
    example: 'Message endpoint',
    description: 'Message endpoint',
  })
  readonly message: string;

  @ApiProperty()
  readonly data?: T;
}

export class PaginationQueryDto {
  @ApiPropertyOptional({
    minimum: 0,
    default: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  readonly offset?: number = 0;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  readonly limit?: number = 10;
}

export class PagingDto {
  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  itemsPerPage: number;

  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  totalPages: number;
}

export interface PageMetaDtoParameters {
  totalItems: number;
  options: PaginationQueryDto;
}

export class PaginationMetaDto {
  @ApiProperty()
  paging: PagingDto = {
    totalItems: 0,
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 1,
  };

  constructor({ totalItems, options }: PageMetaDtoParameters) {
    this.paging.totalItems = totalItems;
    this.paging.currentPage = Math.floor(options.offset / options.limit) + 1;
    this.paging.itemsPerPage = options.limit;
    this.paging.totalPages = Math.ceil(totalItems / options.limit);
  }
}

export class ResponsePagingSerialization<T = Record<string, any>> extends PickType(ResponseDataSerialization, ['statusCode', 'message'] as const) {
  @ApiProperty({ type: () => PaginationMetaDto })
  readonly meta: PaginationMetaDto;

  @IsArray()
  @ApiProperty({
    isArray: true,
  })
  readonly data: T[];
}
