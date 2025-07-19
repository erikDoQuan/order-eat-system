import { Injectable } from '@nestjs/common';
import { CreateUserTransactionDto } from './dto/create-user-transaction.dto';
import { DrizzleService } from '../../database/drizzle/drizzle.service';
import { userTransactions } from '../../database/schema/user_transactions';
import { sql, inArray, eq, and } from 'drizzle-orm';
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

  async updateByOrderId(orderId: string, update: Partial<CreateUserTransactionDto> & { method?: string }) {
    // Nếu truyền method, where theo cả orderId và method
    if (update.method) {
      return this.drizzleService.db.update(userTransactions)
        .set({
          ...update,
          amount: update.amount ? update.amount.toString() : undefined,
          transTime: update.transTime ? new Date(update.transTime) : undefined,
        })
        .where(and(
          eq(userTransactions.orderId, orderId),
          eq(userTransactions.method, update.method)
        ));
    }
    // Nếu update status thành success, chỉ update transaction method cash
    if (String(update.status).toLowerCase() === 'success') {
      return this.drizzleService.db.update(userTransactions)
        .set({
          ...update,
          amount: update.amount ? update.amount.toString() : undefined,
          transTime: update.transTime ? new Date(update.transTime) : undefined,
        })
        .where(and(
          eq(userTransactions.orderId, orderId),
          eq(userTransactions.method, 'cash')
        ));
    }
    // Ngược lại, update tất cả transaction theo orderId
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
      const data = transactions.map(t => {
        const order = orderMap.get(t.orderId) || null;
        let statusText = t.status;
        if (order && order.status === 'completed') statusText = 'Hoàn thành';
        else if (t.status === 'success') statusText = 'Hoàn thành';
        else if (t.status === 'pending') statusText = 'Chờ xử lý';
        else if (t.status === 'cancelled') statusText = 'Đã hủy';
        else if (t.status === 'failed') statusText = 'Thất bại';
        return {
          ...t,
          user: userMap.get(t.userId) || null,
          order,
          statusText,
        };
      });

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

  async findByOrderId(orderId: string) {
    return this.drizzleService.db.select().from(userTransactions).where(eq(userTransactions.orderId, orderId));
  }
} 