
import { IsOptional, IsString, IsUUID, Min, Max, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'ID đơn hàng được đánh giá' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ description: 'Số sao đánh giá (1-5)', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Bình luận chi tiết' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ 
    description: 'ID của người dùng đánh giá (nếu có)',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
