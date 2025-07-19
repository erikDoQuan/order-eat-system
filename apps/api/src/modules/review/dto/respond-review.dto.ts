import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength } from 'class-validator';

export class RespondReviewDto {
  @ApiProperty({ example: 'a1b2c3d4-5678-90ab-cdef-1234567890ab', description: 'ID của review' })
  @IsUUID()
  reviewId: string;

  @ApiProperty({ example: 'Cảm ơn bạn đã góp ý!', description: 'Phản hồi của admin' })
  @IsString()
  @MaxLength(500)
  adminReply: string;
}
