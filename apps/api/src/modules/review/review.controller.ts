// src/modules/review/review.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { FetchReviewsDto } from './dto/fetch-reviews.dto';
import { RespondReviewDto } from './dto/respond-review.dto';
import { Response } from '~/common/decorators/response.decorator';
import { RequireUser } from '~/common/decorators/require-user.decorator';
import { GetUser } from '~/common/decorators/get-user.decorator';
import { User } from '~/database/schema';
import { AccessTokenGuard } from '~/common/guards/access-token.guard';
import { AdminGuard } from '~/common/guards/admin.guard';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách đánh giá',
    description: 'Trả về danh sách tất cả các đánh giá có thể lọc theo orderId, userId, rating, ...',
  })
  @Response({ message: 'Lấy danh sách đánh giá thành công' })
  findAll(@Query() query: FetchReviewsDto) {
    return this.reviewService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết đánh giá theo ID' })
  @Response({ message: 'Lấy chi tiết đánh giá thành công' })
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo đánh giá mới' })
  @Response({ message: 'Tạo đánh giá thành công' })
  create(@Body() body: CreateReviewDto) {
    return this.reviewService.create(body);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật đánh giá theo ID' })
  @Response({ message: 'Cập nhật đánh giá thành công' })
  update(@Param('id') id: string, @Body() body: UpdateReviewDto, @GetUser() user: User) {
    return this.reviewService.update(id, body, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá đánh giá theo ID' })
  @Response({ message: 'Xoá đánh giá thành công' })
  delete(@Param('id') id: string) {
    return this.reviewService.delete(id);
  }

  @Post('admin/respond')
  @ApiOperation({ summary: 'Admin phản hồi đánh giá' })
  @Response({ message: 'Phản hồi đánh giá thành công' })
  respondToReview(@Body() body: RespondReviewDto) {
    return this.reviewService.respondToReview(body);
  }
}
