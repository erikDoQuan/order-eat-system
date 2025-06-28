import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumberString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDishOptionDto {
  @ApiProperty({ format: 'uuid', description: 'ID món ăn liên quan' })
  @IsUUID()
  dishId: string;

  @ApiProperty({ description: 'Tên tùy chọn món ăn (VD: Đế viền phô mai)' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Giá cộng thêm của tùy chọn (VD: 10000)',
    example: '10000',
  })
  @IsNumberString()
  @IsOptional()
  price?: string;

  @ApiPropertyOptional({ description: 'Mô tả chi tiết tùy chọn' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Tùy chọn này có bắt buộc phải chọn hay không',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;
}
