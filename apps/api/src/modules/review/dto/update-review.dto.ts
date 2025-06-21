import { IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReviewDto {
  @ApiPropertyOptional({ description: 'Số sao mới (1-5)', example: 4 })
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiPropertyOptional({ description: 'Bình luận mới', example: 'Sau khi thử lại, món ăn vẫn giữ chất lượng tốt.' })
  @IsOptional()
  @IsString()
  comment?: string;
}
