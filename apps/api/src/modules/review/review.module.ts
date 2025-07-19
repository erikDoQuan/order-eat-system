import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { AccessTokenGuard } from '~/common/guards/access-token.guard';
import { ReviewRepository } from '~/database/repositories/review.repository';
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { RespondReviewDto } from './dto/respond-review.dto';
import { AdminGuard } from '~/common/guards/admin.guard';
import { ReviewAdminController } from './review-admin.controller';

@Module({
    imports: [JwtModule.register({})],
  controllers: [ReviewController, ReviewAdminController],
  providers: [ReviewService, ReviewRepository],
})
export class ReviewModule {}
