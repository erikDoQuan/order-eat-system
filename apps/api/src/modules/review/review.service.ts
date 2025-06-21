
import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { FetchReviewsDto } from './dto/fetch-reviews.dto';
import { ReviewRepository } from '~/database/repositories/review.repository';
import { CreateReviewInput } from './review.types';

@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepo: ReviewRepository) {}

  findAll(dto: FetchReviewsDto) {
    return this.reviewRepo.find(dto);
  }

  findOne(id: string) {
    return this.reviewRepo.findOne(id);
  }

  create(data: CreateReviewInput) {
    return this.reviewRepo.create(data);
  }

  update(id: string, data: UpdateReviewDto) {
    return this.reviewRepo.update(id, data);
  }

  delete(id: string) {
    return this.reviewRepo.delete(id);
  }
}
