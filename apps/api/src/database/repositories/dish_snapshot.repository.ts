import { Injectable } from '@nestjs/common';
import { dishSnapshots } from '../schema/dish_snapshot';
import { DrizzleService } from '../drizzle/drizzle.service';
import { eq } from 'drizzle-orm';

@Injectable()
export class DishSnapshotRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(data: any) {
    const [snapshot] = await this.drizzle.db.insert(dishSnapshots).values(data).returning();
    return snapshot;
  }

  async findOne(id: string) {
    return this.drizzle.db.query.dishSnapshots.findFirst({ where: (fields) => eq(fields.id, id) });
  }
} 