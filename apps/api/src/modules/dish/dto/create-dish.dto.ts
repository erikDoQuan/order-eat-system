import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumberString, IsOptional, IsString, IsUUID } from 'class-validator';

export enum DishStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
}

export enum DishSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export class CreateDishDto {
  @ApiProperty({ description: 'Tên món ăn' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Giá gốc của món ăn (kiểu string vì decimal)',
    example: '189000',
  })
  @IsNumberString()
  basePrice: string;

  @ApiProperty({ format: 'uuid', description: 'ID người tạo' })
  @IsUUID()
  createdBy: string;

  @ApiProperty({ format: 'uuid', description: 'ID người cập nhật cuối' })
  @IsUUID()
  updatedBy: string;

  @ApiPropertyOptional({ description: 'Mô tả món ăn' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'URL ảnh món ăn',
    example: 'https://cdn.example.com/pizza.png',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    enum: DishStatus,
    description: 'Trạng thái món ăn',
    default: DishStatus.AVAILABLE,
  })
  @IsEnum(DishStatus)
  @IsOptional()
  status?: DishStatus;

  @ApiPropertyOptional({
    description: 'Tên loại món ăn (ví dụ: Hải sản, Bò,... )',
  })
  @IsString()
  @IsOptional()
  typeName?: string;

  @ApiPropertyOptional({
    enum: DishSize,
    description: 'Kích thước món ăn',
  })
  @IsEnum(DishSize)
  @IsOptional()
  size?: DishSize;

  @ApiPropertyOptional({ format: 'uuid', description: 'ID danh mục món ăn' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;
}