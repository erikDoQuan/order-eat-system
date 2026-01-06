import { Injectable } from '@nestjs/common';
import { and, count, desc, eq, ilike, inArray, sql, SQL } from 'drizzle-orm';

import { removeDiacritics } from '~/common/utils/diacritics.utils';
import { DrizzleService } from '~/database/drizzle/drizzle.service';
import { dishes } from '~/database/schema/dishes';
import { CreateDishDto } from '~/modules/dish/dto/create-dish.dto';
import { FetchDishesResponseDto } from '~/modules/dish/dto/fetch-dish-response.dto';
import { FetchDishesDto } from '~/modules/dish/dto/fetch-dish.dto';
// import { FetchDishesResponseDto } from '~/modules/dish/dto/fetch-dishes-response.dto';

import { UpdateDishDto } from '~/modules/dish/dto/update-dish.dto';

@Injectable()
export class DishRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async find(fetchDishesDto: FetchDishesDto): Promise<{
    data: FetchDishesResponseDto[];
    totalItems: number;
  }> {
    const { search, offset, limit, categoryIds } = fetchDishesDto;

    const baseConditions: SQL[] = [];

    if (search?.trim()) {
      const searchTerm = `%${removeDiacritics(search.trim())}%`;
      baseConditions.push(ilike(sql`unaccent(${dishes.name})`, searchTerm));
    }

    if (categoryIds?.length) {
      baseConditions.push(inArray(dishes.categoryId, categoryIds));
    }

    baseConditions.push(eq(dishes['isActive'], true));
    baseConditions.push(eq(dishes['status'], 'available'));

    const whereCondition = baseConditions.length ? and(...baseConditions) : undefined;

    const [query, countQuery] = await Promise.all([
      this.drizzle.db.query.dishes.findMany({
        where: whereCondition,
        limit,
        offset,
        orderBy: desc(dishes.createdAt),
      }),
      this.drizzle.db.select({ count: count() }).from(dishes).where(whereCondition),
    ]);

    const mapped = query.map((dish: any) => ({
      ...dish,
      createdAt: dish.createdAt instanceof Date ? dish.createdAt.toISOString() : dish.createdAt,
      updatedAt: dish.updatedAt instanceof Date ? dish.updatedAt.toISOString() : dish.updatedAt,
      basePrice: dish.basePrice?.toString?.() ?? dish.basePrice,
    }));

    return {
      data: mapped,
      totalItems: countQuery?.[0]?.count || 0,
    };
  }

  async findOne(id: string): Promise<any> {
    return this.drizzle.db.query.dishes.findFirst({
      where: and(eq(dishes.id, id), eq(dishes['isActive'], true)),
    });
  }

  async findAll(): Promise<any[]> {
    return this.drizzle.db.query.dishes.findMany({
      where: and(eq(dishes['isActive'], true), eq(dishes['status'], 'available')),
      orderBy: desc(dishes.createdAt),
    });
  }

  async findAllForAdmin(): Promise<any[]> {
    return this.drizzle.db.query.dishes.findMany({
      where: eq(dishes['isActive'], true),
      orderBy: desc(dishes.createdAt),
    });
  }

  async create(data: CreateDishDto): Promise<any> {
    const [dish] = await this.drizzle.db.insert(dishes).values({
      ...data,
      basePrice: data.basePrice ?? '', // đảm bảo basePrice luôn có giá trị
    }).returning();
    return this.findOne(dish.id);
  }

  async update(id: string, data: UpdateDishDto): Promise<any> {
    const [updated] = await this.drizzle.db
      .update(dishes)
      .set(data as any)
      .where(eq(dishes.id, id))
      .returning();

    return updated ? this.findOne(updated.id) : null;
  }

  async delete(id: string): Promise<any> {
    const [deleted] = await this.drizzle.db
      .update(dishes)
      .set({ isActive: false } as any)
      .where(eq(dishes.id, id))
      .returning();
    return deleted ? this.findOne(deleted.id) : null;
  }
}
