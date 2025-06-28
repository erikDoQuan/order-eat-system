import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DrizzleService } from '~/database/drizzle/drizzle.service';
import { dishOptions } from '~/database/schema/dish_option';
import { CreateDishOptionDto } from './dto/create-dish-option.dto';
import { UpdateDishOptionDto } from './dto/update-dish-option.dto';

@Injectable()
export class DishOptionService {
  constructor(private readonly drizzle: DrizzleService) {}

  async findAll() {
    return this.drizzle.db.select().from(dishOptions);
  }

  async findByDishId(dishId: string) {
    return this.drizzle.db.select().from(dishOptions).where(eq(dishOptions.dishId, dishId));
  }

  async create(dto: CreateDishOptionDto) {
    const [newOption] = await this.drizzle.db.insert(dishOptions).values(dto).returning();
    return newOption;
  }

  async update(id: string, dto: UpdateDishOptionDto) {
    const [updated] = await this.drizzle.db.update(dishOptions).set(dto).where(eq(dishOptions.id, id)).returning();
    return updated;
  }

  async delete(id: string) {
    await this.drizzle.db.delete(dishOptions).where(eq(dishOptions.id, id));
    return { message: 'Đã xóa tùy chọn món ăn.' };
  }
}
