// src/modules/review/dto/fetch-reviews.dto.ts

import { IsOptional, IsString, IsNumber, IsUUID } from 'class-validator';
import { ReviewResponseDto } from './review-response.dto';

export class FetchReviewsDto {
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;
}

export class FetchReviewsResponseDto {
  // @ApiProperty({ type: [ReviewResponseDto] }) // This line is removed as per the edit hint.
  data: ReviewResponseDto[];

  // @ApiProperty() // This line is removed as per the edit hint.
  totalItems: number;
}
