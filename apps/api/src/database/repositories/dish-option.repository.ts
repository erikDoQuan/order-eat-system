import { Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';

import { DrizzleService } from '~/database/drizzle/drizzle.service';
import { DishOption, dishOptions } from '~/database/schema/dish_option';

@Injectable()
export class DishOptionRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async findByDishId(dishId: string): Promise<DishOption[]> {
    return this.drizzle.db.select().from(dishOptions).where(eq(dishOptions.dishId, dishId)).orderBy(desc(dishOptions.createdAt));
  }

  async findOne(id: string): Promise<DishOption | null> {
    const result = await this.drizzle.db.select().from(dishOptions).where(eq(dishOptions.id, id));
    return result[0] || null;
  }

  async findAll(): Promise<DishOption[]> {
    return this.drizzle.db.select().from(dishOptions).orderBy(desc(dishOptions.createdAt));
  }

  async create(data: Pick<DishOption, 'name' | 'dishId'> & Partial<Omit<DishOption, 'name' | 'dishId'>>): Promise<DishOption | null> {
    const [option] = await this.drizzle.db
      .insert(dishOptions)
      .values(data as any)
      .returning();
    return option ? this.findOne(option.id) : null;
  }

  async update(id: string, data: Partial<DishOption>): Promise<DishOption | null> {
    const [updated] = await this.drizzle.db.update(dishOptions).set(data).where(eq(dishOptions.id, id)).returning();
    return updated ? this.findOne(updated.id) : null;
  }

  async delete(id: string): Promise<DishOption | null> {
    const [deleted] = await this.drizzle.db.delete(dishOptions).where(eq(dishOptions.id, id)).returning();
    return deleted ? this.findOne(deleted.id) : null;
  }
}
