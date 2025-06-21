import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { DishWithoutPrice } from '~/database/schema/dishes';

export class FetchDishesDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên món ăn' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Số lượng bỏ qua' })
  @IsOptional()
  @IsNumber()
  offset?: number;

  @ApiPropertyOptional({ description: 'Số lượng lấy ra' })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ type: [String], format: 'uuid', description: 'Lọc theo danh mục' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds?: string[];
}



