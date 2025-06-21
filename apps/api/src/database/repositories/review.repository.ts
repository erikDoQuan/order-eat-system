
import { Injectable } from '@nestjs/common';
import { and, count, desc, eq, ilike, sql, SQL } from 'drizzle-orm';

import { removeDiacritics } from '~/common/utils/diacritics.utils';
import { DrizzleService } from '~/database/drizzle/drizzle.service';
import { Review, ReviewInsert, reviews, ReviewUpdate } from '~/database/schema';
import { FetchReviewsDto, FetchReviewsResponseDto } from '~/modules/review/dto/fetch-reviews.dto';
import { UpdateReviewDto } from '~/modules/review/dto/update-review.dto';
import { CreateReviewInput } from '~/modules/review/review.types';

@Injectable()
export class ReviewRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async find(fetchReviewsDto: FetchReviewsDto): Promise<FetchReviewsResponseDto> {
    const { search, offset, limit, rating, dishId, userId } = fetchReviewsDto;

    const conditions: SQL[] = [];

    if (rating) conditions.push(eq(reviews.rating, rating));
    if (dishId) conditions.push(eq(reviews.dishId, dishId));
    if (userId) conditions.push(eq(reviews.userId, userId));
    if (search?.trim()) {
      const keyword = `%${removeDiacritics(search.trim())}%`;
      conditions.push(ilike(sql`unaccent(${reviews.comment})`, keyword));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

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

  async create(data: CreateReviewInput): Promise<Review> {
    const [created] = await this.drizzle.db
      .insert(reviews)
      .values(data as ReviewInsert)
      .returning();
    return created;
  }

  async update(id: string, data: UpdateReviewDto): Promise<Review | null> {
    const [updated] = await this.drizzle.db
      .update(reviews)
      .set(data as ReviewUpdate)
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
