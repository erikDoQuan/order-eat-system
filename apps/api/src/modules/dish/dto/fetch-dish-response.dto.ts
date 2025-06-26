import { ApiProperty } from '@nestjs/swagger';

import { DishSize, DishStatus } from './create-dish.dto';

export class FetchDishesResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  imageUrl?: string;

  @ApiProperty({ enum: DishStatus })
  status: DishStatus;

  @ApiProperty({ enum: DishSize })
  size?: DishSize;

  @ApiProperty()
  typeName?: string;

  @ApiProperty()
  categoryId?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt?: string;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  updatedBy: string;

  @ApiProperty({ description: 'Giá gốc của món ăn (string, decimal)' })
  basePrice: string;
}
