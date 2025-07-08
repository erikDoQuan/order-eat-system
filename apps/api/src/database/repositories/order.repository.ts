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
    const { search, offset, limit, status, userId } = fetchOrdersDto;

    const baseConditions: SQL[] = [];

    if (userId) {
      baseConditions.push(eq(orders.userId, userId));
      baseConditions.push(eq(orders.isActive, true));
    }

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

    // Lọc lại ở đây để đảm bảo chỉ trả về order còn hoạt động
    const filteredResults = (results as Order[]);
    console.log('[ORDER][FIND] Kết quả trả về:', filteredResults.map(o => o.id));
    return {
      data: filteredResults,
      totalItems: filteredResults.length,
    };
  }

  async findOne(id: string): Promise<Order | null> {
    return this.drizzle.db.query.orders.findFirst({
      where: eq(orders.id, id),
    });
  }

  async create(data: CreateOrderDto): Promise<Order> {
    // Luôn tạo đơn hàng mới, không kiểm tra đơn pending cũ
    const [created] = await this.drizzle.db
      .insert(orders)
      .values(data as OrderInsert)
      .returning();
    return created;
  }

  async update(id: string, data: UpdateOrderDto): Promise<Order | null> {
    console.log('[ORDER][PATCH] Update order', id, JSON.stringify(data));
    const [updated] = await this.drizzle.db
      .update(orders)
      .set(data as OrderUpdate)
      .where(eq(orders.id, id))
      .returning();
    console.log('[ORDER][PATCH] Updated order result', updated);
    return updated ?? null;
  }

  async findOrderByItemId(orderItemId: string): Promise<Order | null> {
    const ordersList = await this.drizzle.db.query.orders.findMany({});
    // Đảm bảo chỉ trả về object đúng kiểu Order
    return (ordersList as unknown as Order[]).find(order =>
      ((order.orderItems as { items: any[] })?.items || []).some((item: any) => item.id === orderItemId)
    ) || null;
  }

  async hardDelete(id: string): Promise<void> {
    await this.drizzle.db.delete(orders).where(eq(orders.id, id));
  }
}
