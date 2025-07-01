import { Injectable } from '@nestjs/common';
import { and, count, desc, eq, ilike, inArray, sql, SQL } from 'drizzle-orm';

import { removeDiacritics } from '~/common/utils/diacritics.utils';
import { DrizzleService } from '../drizzle/drizzle.service';
import {
  orders,
  Order,
  OrderInsert,
  OrderUpdate,
  orderStatusEnum,
} from '../schema';
import {
  FetchOrdersDto,
  FetchOrdersResponseDto,
} from '~/modules/order/dto/fetch-order.dto';
import { CreateOrderDto } from '~/modules/order/dto/create-order.dto';
import { UpdateOrderDto } from '~/modules/order/dto/update-order.dto';

type OrderStatus = typeof orderStatusEnum.enumValues[number];

@Injectable()
export class OrderRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async find(
    fetchOrdersDto: FetchOrdersDto,
  ): Promise<{ data: Order[]; totalItems: number }> {
    const { search, offset, limit, status } = fetchOrdersDto;

    const baseConditions: SQL[] = [];

    if (status && status.length > 0) {
      baseConditions.push(inArray(orders.status, status as OrderStatus[]));
    }

    if (search?.trim()) {
      const searchTerm = `%${removeDiacritics(search.trim())}%`;
      baseConditions.push(ilike(sql`unaccent(${orders.status})`, searchTerm));
    }

    const whereCondition = and(...baseConditions);

    const query = await this.drizzle.db.query.orders.findMany({
      where: whereCondition,
      limit,
      offset,
      orderBy: desc(orders.createdAt),
    });

    const countQuery = await this.drizzle.db
      .select({ count: count() })
      .from(orders)
      .where(whereCondition);

    const [results, countResult] = await Promise.all([query, countQuery]);

    return {
      data: results as Order[],
      totalItems: countResult?.[0]?.count || 0,
    };
  }

  async findOne(id: string): Promise<Order | null> {
    return this.drizzle.db.query.orders.findFirst({
      where: eq(orders.id, id),
    });
  }

  async create(data: CreateOrderDto): Promise<Order> {
    const [created] = await this.drizzle.db
      .insert(orders)
      .values(data as OrderInsert)
      .returning();
    return created;
  }

  async update(id: string, data: UpdateOrderDto): Promise<Order | null> {
    const [updated] = await this.drizzle.db
      .update(orders)
      .set(data as OrderUpdate)
      .where(eq(orders.id, id))
      .returning();
    return updated ?? null;
  }

  async delete(id: string): Promise<Order | null> {
    const [deleted] = await this.drizzle.db
      .update(orders)
      .set({ isActive: false } as OrderUpdate)
      .where(eq(orders.id, id))
      .returning();
    return deleted ?? null;
  }
}
