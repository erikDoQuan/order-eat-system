
import { Injectable, ConflictException, ForbiddenException } from '@nestjs/common';
import { and, count, desc, eq, ilike, sql, SQL } from 'drizzle-orm';

import { removeDiacritics } from '~/common/utils/diacritics.utils';
import { DrizzleService } from '~/database/drizzle/drizzle.service';
import { Review, ReviewInsert, reviews, ReviewUpdate, User } from '~/database/schema';
import { FetchReviewsDto, FetchReviewsResponseDto } from '~/modules/review/dto/fetch-reviews.dto';
import { UpdateReviewDto } from '~/modules/review/dto/update-review.dto';
import { CreateReviewDto } from '~/modules/review/dto/create-review.dto';

@Injectable()
export class ReviewRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async find(fetchReviewsDto: FetchReviewsDto): Promise<FetchReviewsResponseDto> {
    const { search, offset, limit, rating, orderId, userId } = fetchReviewsDto;

    const baseConditions: SQL[] = [];

    // Nếu có userId thì filter theo user, không có thì trả về tất cả (giống orders)
    if (userId) {
      baseConditions.push(eq(reviews.userId, userId));
      baseConditions.push(eq(reviews.isActive, true));
    }

    if (rating) baseConditions.push(eq(reviews.rating, rating));
    if (orderId) baseConditions.push(eq(reviews.orderId, orderId));
    
    if (search?.trim()) {
      const keyword = `%${removeDiacritics(search.trim())}%`;
      baseConditions.push(ilike(sql`unaccent(${reviews.comment})`, keyword));
    }

    const whereClause = baseConditions.length ? and(...baseConditions) : undefined;

    const query = await this.drizzle.db.query.reviews.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: desc(reviews.createdAt),
    });

    const countQuery = await this.drizzle.db
      .select({ count: count() })
      .from(reviews)
      .where(whereClause);

    return {
      data: query,
      totalItems: countQuery?.[0]?.count || 0,
    };
  }

  async findOne(id: string): Promise<Review | null> {
    return this.drizzle.db.query.reviews.findFirst({
      where: eq(reviews.id, id),
    });
  }

  async findByOrderId(orderId: string): Promise<Review | null> {
    return this.drizzle.db.query.reviews.findFirst({
      where: eq(reviews.orderId, orderId),
    });
  }

  async create(data: CreateReviewDto): Promise<Review> {
    // Kiểm tra xem order đã có review chưa
    const existingReview = await this.findByOrderId(data.orderId);
    if (existingReview) {
      throw new ConflictException('Đơn hàng này đã được đánh giá rồi');
    }

    const reviewData = {
      orderId: data.orderId,
      rating: data.rating,
      comment: data.comment,
      userId: data.userId,
      createdBy: data.userId, // Nếu có userId thì set createdBy = userId
    } as ReviewInsert;

    const [created] = await this.drizzle.db
      .insert(reviews)
      .values(reviewData)
      .returning();
    return created;
  }

  async update(id: string, data: UpdateReviewDto, user: User): Promise<Review | null> {
    // Kiểm tra xem review có thuộc về user này không
    const existingReview = await this.findOne(id);
    if (!existingReview) {
      return null;
    }
    
    if (existingReview.userId !== user.id) {
      throw new ForbiddenException('Bạn chỉ có thể cập nhật đánh giá của chính mình');
    }

    const updateData = {
      rating: data.rating,
      comment: data.comment,
      updatedBy: user.id,
    } as ReviewUpdate;

    const [updated] = await this.drizzle.db
      .update(reviews)
      .set(updateData)
      .where(eq(reviews.id, id))
      .returning();

    return updated || null;
  }

  async delete(id: string): Promise<Review | null> {
    const [deleted] = await this.drizzle.db
      .delete(reviews)
      .where(eq(reviews.id, id))
      .returning();

    return deleted || null;
  }
}
