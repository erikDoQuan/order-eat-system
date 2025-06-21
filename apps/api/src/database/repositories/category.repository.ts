import { Injectable } from '@nestjs/common';
import { and, count, desc, eq, ilike, inArray, sql, SQL } from 'drizzle-orm';

import { removeDiacritics } from '~/common/utils/diacritics.utils';
import { DrizzleService } from '~/database/drizzle/drizzle.service';
import {
  categories,
  Category,
  CategoryInsert,
  CategoryUpdate,
} from '~/database/schema';
import { CreateCategoryDto } from '~/modules/category/dto/create-category.dto';
import {
  FetchCategoriesDto,
  FetchCategoriesResponseDto,
} from '~/modules/category/dto/fetch-category.dto';

@Injectable()
export class CategoryRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async find(fetchDto: FetchCategoriesDto): Promise<FetchCategoriesResponseDto> {
    const { search, offset = 0, limit = 10, status } = fetchDto;

    const baseConditions: SQL[] = [];

    if (status?.length) {
      baseConditions.push(inArray(categories.status, status));
    }

    if (search?.trim()) {
      const searchTerm = `%${removeDiacritics(search.trim())}%`;
      baseConditions.push(ilike(sql`unaccent(${categories.name})`, searchTerm));
    }

    const whereCondition =
      baseConditions.length > 0 ? and(...baseConditions) : undefined;

    const [data, countQuery] = await Promise.all([
      this.drizzle.db.query.categories.findMany({
        where: whereCondition,
        limit,
        offset,
        orderBy: desc(categories.createdAt),
      }),
      this.drizzle.db
        .select({ count: count() })
        .from(categories)
        .where(whereCondition),
    ]);

    return {
      data,
      totalItems: countQuery?.[0]?.count || 0,
    };
  }

  async findOne(id: string): Promise<Category | null> {
    return this.drizzle.db.query.categories.findFirst({
      where: eq(categories.id, id),
    });
  }

  async create(data: CreateCategoryDto): Promise<Category | null> {
    const [created] = await this.drizzle.db
      .insert(categories)
      .values(data as CategoryInsert)
      .returning();

    return this.findOne(created.id);
  }

  async update(id: string, data: CategoryUpdate): Promise<Category | null> {
    const [updated] = await this.drizzle.db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();

    return updated ? this.findOne(updated.id) : null;
  }

  async delete(id: string): Promise<Category | null> {
    const [deleted] = await this.drizzle.db
      .update(categories)
      .set({ isActive: false } as CategoryUpdate)
      .where(eq(categories.id, id))
      .returning();

    return deleted ? this.findOne(deleted.id) : null;
  }

  async findAll(): Promise<Category[]> {
    const result = await this.find({} as FetchCategoriesDto);
    return result.data;
  }
}
