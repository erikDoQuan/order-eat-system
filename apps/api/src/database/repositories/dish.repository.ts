import { Injectable } from '@nestjs/common';
import { and, count, desc, eq, ilike, inArray, sql, SQL } from 'drizzle-orm';

import { removeDiacritics } from '~/common/utils/diacritics.utils';
import { DrizzleService } from '~/database/drizzle/drizzle.service';
import { Dish, DishUpdate, DishWithoutPrice, dishes } from '~/database/schema/dishes';
import { CreateDishDto } from '~/modules/dish/dto/create-dish.dto';
import { FetchDishesResponseDto } from '~/modules/dish/dto/fetch-dish-response.dto';
import { FetchDishesDto, } from '~/modules/dish/dto/fetch-dish.dto';
// import { FetchDishesResponseDto } from '~/modules/dish/dto/fetch-dishes-response.dto';


import { UpdateDishDto } from '~/modules/dish/dto/update-dish.dto';

@Injectable()
export class DishRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async find(fetchDishesDto: FetchDishesDto): Promise<{
data: FetchDishesResponseDto  [];

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

    const whereCondition = baseConditions.length ? and(...baseConditions) : undefined;

    const [query, countQuery] = await Promise.all([
      this.drizzle.db.query.dishes.findMany({
        where: whereCondition,
        limit,
        offset,
        orderBy: desc(dishes.createdAt),
        columns: {

        },
      }),
      this.drizzle.db.select({ count: count() }).from(dishes).where(whereCondition),
    ]);

    return {
      data: query as FetchDishesResponseDto[],
      totalItems: countQuery?.[0]?.count || 0,
    };
  }

  async findOne(id: string): Promise<DishWithoutPrice | null> {
    return this.drizzle.db.query.dishes.findFirst({
      where: eq(dishes.id, id),
      columns: {
        basePrice: false, 
      },
    });
  }

  async findAll(): Promise<DishWithoutPrice[]> {
    return this.drizzle.db.query.dishes.findMany({
      orderBy: desc(dishes.createdAt),
      columns: {
        basePrice: false,
      },
    });
  }

  async create(data: CreateDishDto): Promise<DishWithoutPrice> {
    const [dish] = await this.drizzle.db.insert(dishes).values(data).returning();
    return this.findOne(dish.id);
  }

  async update(id: string, data: UpdateDishDto): Promise<DishWithoutPrice | null> {
    const [updated] = await this.drizzle.db
      .update(dishes)
      .set(data as DishUpdate)
      .where(eq(dishes.id, id))
      .returning();

    return updated ? this.findOne(updated.id) : null;
  }

  async delete(id: string): Promise<DishWithoutPrice | null> {
    const [deleted] = await this.drizzle.db.delete(dishes).where(eq(dishes.id, id)).returning();
    return deleted ? this.findOne(deleted.id) : null;
  }
}