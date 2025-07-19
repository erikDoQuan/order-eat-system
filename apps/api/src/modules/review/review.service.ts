
import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { FetchReviewsDto } from './dto/fetch-reviews.dto';
import { ReviewRepository } from '~/database/repositories/review.repository';
import { User } from '~/database/schema';
import { RespondReviewDto } from './dto/respond-review.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepo: ReviewRepository) {}

  findAll(dto: FetchReviewsDto) {
    return this.reviewRepo.find(dto);
  }

  findOne(id: string) {
    return this.reviewRepo.findOne(id);
  }

  create(data: CreateReviewDto) {
    return this.reviewRepo.create(data);
  }

  update(id: string, data: UpdateReviewDto, user: User) {
    return this.reviewRepo.update(id, data, user);
  }

  delete(id: string) {
    return this.reviewRepo.delete(id);
  }

  async respondToReview(dto: RespondReviewDto, admin?: User) {
    const { reviewId, adminReply } = dto;
    const review = await this.reviewRepo.findOne(reviewId);
    if (!review) {
      throw new NotFoundException('Review không tồn tại');
    }
    let updatedReview;
    if (admin) {
      updatedReview = await this.reviewRepo.updateAdminReplyWithAdmin(reviewId, adminReply, admin.id);
    } else {
      updatedReview = await this.reviewRepo.updateAdminReply(reviewId, adminReply);
    }
    return updatedReview;
  }

  async respondReview(adminId: string, dto: RespondReviewDto) {
    const { reviewId, adminReply } = dto;
    const review = await this.reviewRepo.findOne(reviewId);
    if (!review) {
      throw new NotFoundException('Review không tồn tại');
    }
    await this.reviewRepo.updateAdminReplyWithAdmin(reviewId, adminReply, adminId);
    return { message: 'Phản hồi thành công!' };
  }
}
