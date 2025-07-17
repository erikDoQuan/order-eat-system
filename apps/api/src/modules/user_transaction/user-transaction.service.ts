import { Injectable } from '@nestjs/common';
import { CreateUserTransactionDto } from './dto/create-user-transaction.dto';
import { DrizzleService } from '../../database/drizzle/drizzle.service';
import { userTransactions } from '../../database/schema/user_transactions';
import { sql, inArray, eq } from 'drizzle-orm';
import { users } from '../../database/schema/users';
import { orders } from '../../database/schema/orders';

@Injectable()
export class UserTransactionService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(createUserTransactionDto: CreateUserTransactionDto) {
    // Lưu giao dịch vào bảng user_transactions
    const [result] = await this.drizzleService.db.insert(userTransactions).values({
      ...createUserTransactionDto,
      amount: createUserTransactionDto.amount.toString(),
      transTime: new Date(createUserTransactionDto.transTime),
    }).returning();
    return result;
  }

  async updateByOrderId(orderId: string, update: Partial<CreateUserTransactionDto>) {
    return this.drizzleService.db.update(userTransactions)
      .set({
        ...update,
        amount: update.amount ? update.amount.toString() : undefined,
        transTime: update.transTime ? new Date(update.transTime) : undefined,
      })
      .where(eq(userTransactions.orderId, orderId));
  }

  async findAllWithUserOrder(page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      // Lấy danh sách giao dịch, chỉ lấy đúng các trường cần thiết
      const transactions = await this.drizzleService.db.select({
        id: userTransactions.id,
        userId: userTransactions.userId,
        orderId: userTransactions.orderId,
        amount: userTransactions.amount,
        method: userTransactions.method,
        status: userTransactions.status,
        transTime: userTransactions.transTime,
        transactionCode: userTransactions.transactionCode,
        description: userTransactions.description,
        createdAt: userTransactions.createdAt,
        updatedAt: userTransactions.updatedAt,
      })
        .from(userTransactions)
        .limit(limit).offset(offset);

      // Lấy userId và orderId duy nhất
      const userIds = [...new Set(transactions.map(t => t.userId).filter(Boolean))];
      const orderIds = [...new Set(transactions.map(t => t.orderId).filter(Boolean))];

      // Lấy thông tin user
      let userList = [];
      let orderList = [];
      if (userIds.length) {
        userList = await this.drizzleService.db.select().from(users)
          .where(inArray(users.id, userIds));
      }
      if (orderIds.length) {
        orderList = await this.drizzleService.db.select().from(orders)
          .where(inArray(orders.id, orderIds));
      }

      // Map user, order vào transaction
      const userMap = new Map(userList.map(u => [u.id, u]));
      const orderMap = new Map(orderList.map(o => [o.id, o]));
      const data = transactions.map(t => ({
        ...t,
        user: userMap.get(t.userId) || null,
        order: orderMap.get(t.orderId) || null,
      }));

      // Đếm tổng số giao dịch
      const countResult = await this.drizzleService.db
        .select({ count: sql`count(*)` })
        .from(userTransactions);
      const count = Array.isArray(countResult) && countResult[0] && (countResult[0].count) ? countResult[0].count : 0;

      return {
        data,
        users: userList,
        orders: orderList,
        page,
        limit,
        total: Number(count),
      };
    } catch (err) {
      console.error('UserTransactionService.findAllWithUserOrder error:', err);
      throw err;
    }
  }
} 