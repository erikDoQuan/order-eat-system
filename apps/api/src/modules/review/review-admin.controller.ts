import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ReviewService } from './review.service';
import { RespondReviewDto } from './dto/respond-review.dto';
import { AccessTokenGuard } from '~/common/guards/access-token.guard';
import { AdminGuard } from '~/common/guards/admin.guard';

@Controller('reviews/admin')
@UseGuards(AccessTokenGuard, AdminGuard)
export class ReviewAdminController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('respond')
  async respondToReview(@Req() req: any, @Body() dto: RespondReviewDto) {
    const adminId = req.user.id;
    return this.reviewService.respondReview(adminId, dto);
  }
} 