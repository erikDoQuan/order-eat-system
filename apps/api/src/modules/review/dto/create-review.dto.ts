
import { IsOptional, IsString, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'ID món ăn được đánh giá' })
  @IsUUID()
  dishId: string;

  @ApiProperty({ description: 'Số sao đánh giá (1-5)', minimum: 1, maximum: 5 })
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Bình luận chi tiết' })
  @IsOptional()
  @IsString()
  comment?: string;
}
