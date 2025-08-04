import { Injectable } from '@nestjs/common';
import { and, between, count, desc, eq, ilike, inArray, sql, SQL } from 'drizzle-orm';

import { removeDiacritics } from '~/common/utils/diacritics.utils';
import { CreateOrderDto } from '~/modules/order/dto/create-order.dto';
import { FetchOrdersDto, FetchOrdersResponseDto } from '~/modules/order/dto/fetch-order.dto';
import { UpdateOrderDto } from '~/modules/order/dto/update-order.dto';
import { DrizzleService } from '../drizzle/drizzle.service';
import { Order, OrderInsert, orders, orderStatusEnum, OrderUpdate } from '../schema';

type OrderStatus = (typeof orderStatusEnum.enumValues)[number];

@Injectable()
export class OrderRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async find(fetchOrdersDto: FetchOrdersDto): Promise<{ data: Order[]; totalItems: number }> {
    const { search, offset, limit, status, userId } = fetchOrdersDto;

    const baseConditions: SQL[] = [];

    if (userId) {
      baseConditions.push(eq(orders.userId, userId));
      baseConditions.push(eq(orders.isActive, true));
    }

    if (status && status.length > 0) {
      baseConditions.push(inArray(orders.status, status));
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
      with: {
        reviews: true,
      },
    });

    const countQuery = await this.drizzle.db.select({ count: count() }).from(orders).where(whereCondition);

    const [results, countResult] = await Promise.all([query, countQuery]);

    // Lọc lại ở đây để đảm bảo chỉ trả về order còn hoạt động
    const filteredResults = results as Order[];
    return {
      data: filteredResults,
      totalItems: filteredResults.length,
    };
  }

  async findOne(id: string): Promise<Order | null> {
    return this.drizzle.db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        reviews: true,
      },
    });
  }

  async findOneByOrderNumber(orderNumber: number): Promise<Order | null> {
    return this.drizzle.db.query.orders.findFirst({
      where: eq(orders.orderNumber, orderNumber),
      with: {
        reviews: true,
      },
    });
  }

  async createOrUpdateByAppTransId(data: CreateOrderDto): Promise<Order> {
    if (data.appTransId) {
      const existed = await this.findOneByAppTransId(data.appTransId);
      if (existed) {
        // Nếu là ZaloPay order (có appTransId), không update status
        const updateData = { ...data, totalAmount: String(data.totalAmount) };
        if (data.appTransId) {
          // ZaloPay orders luôn giữ status pending
          delete updateData.status;
        }
        await this.update(existed.id, updateData);
        return this.findOne(existed.id);
      }
    }
    // Khi tạo mới, luôn lưu status là pending cho ZaloPay orders
    const [created] = await this.drizzle.db
      .insert(orders)
      .values({ ...data, status: 'pending' } as OrderInsert)
      .returning();
    return created;
  }

  async create(data: CreateOrderDto): Promise<Order> {
    return this.createOrUpdateByAppTransId(data);
  }

  async update(id: string, data: UpdateOrderDto): Promise<Order | null> {
    console.log('🔍 Repository update called with:', { id, data });
    const [updated] = await this.drizzle.db
      .update(orders)
      .set(data as OrderUpdate)
      .where(eq(orders.id, id))
      .returning();
    console.log('🔍 Repository update result:', updated);
    return updated ?? null;
  }

  async findOrderByItemId(orderItemId: string): Promise<Order | null> {
    const ordersList = await this.drizzle.db.query.orders.findMany({
      with: {
        reviews: true,
      },
    });
    // Đảm bảo chỉ trả về object đúng kiểu Order
    return (
      (ordersList as unknown as Order[]).find(order =>
        ((order.orderItems as { items: any[] })?.items || []).some((item: any) => item.id === orderItemId),
      ) || null
    );
  }

  async findCompletedInRange(from: string, to: string, statusList: string[] = ['completed']): Promise<Order[]> {
    // Luôn lấy từ đầu ngày from đến cuối ngày to
    const fromDate = new Date(from + 'T00:00:00.000Z');
    const toDate = new Date(to + 'T23:59:59.999Z');
    // Ép kiểu statusList về đúng union type
    const statusTyped = statusList as (typeof orderStatusEnum.enumValues)[number][];
    const results = await this.drizzle.db.query.orders.findMany({
      where: and(inArray(orders.status, statusTyped), between(orders.createdAt, fromDate, toDate)),
      orderBy: desc(orders.createdAt),
      with: {
        reviews: true,
      },
    });
    return results as Order[];
  }

  async hardDelete(id: string): Promise<void> {
    await this.drizzle.db.delete(orders).where(eq(orders.id, id));
  }

  // Thêm hàm findFirst để tìm đơn hàng đầu tiên theo điều kiện
  async findFirst(args: { where: any; orderBy?: any }): Promise<Order | null> {
    return this.drizzle.db.query.orders.findFirst(args);
  }

  // Thêm hàm findOneByAppTransId để tìm đơn hàng theo appTransId
  async findOneByAppTransId(appTransId: string): Promise<Order | null> {
    return this.drizzle.db.query.orders.findFirst({
      where: eq(orders.appTransId, appTransId),
    });
  }
}
