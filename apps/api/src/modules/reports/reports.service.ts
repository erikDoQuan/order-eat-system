import { Injectable } from '@nestjs/common';
import { inArray } from 'drizzle-orm';

import { DrizzleService } from '~/database/drizzle/drizzle.service';
import { OrderRepository } from '~/database/repositories/order.repository';
import { UserRepository } from '~/database/repositories/user.repository';
import { userTransactions } from '~/database/schema/user_transactions';

@Injectable()
export class ReportsService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly userRepository: UserRepository,
    private readonly drizzleService: DrizzleService,
  ) {}

  async getRevenueReport(from: string, to: string) {
    const fromTrim = from.trim();
    const toTrim = to.trim();
    // Chỉ lấy đơn hàng có status là 'completed'
    const ordersCompleted = await this.orderRepository.findCompletedInRange(fromTrim, toTrim, ['completed']);
    // Lấy danh sách userId duy nhất
    const userIds = Array.from(new Set(ordersCompleted.map(o => o.userId).filter(Boolean)));
    let userMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const users = await this.userRepository.findManyByIds(userIds);
      userMap = Object.fromEntries(users.map(u => [u.id, u]));
    }
    // Lấy payment method và amount từ user_transactions (chỉ lấy status = 'success')
    const paymentMap: Record<string, { method: string; amount: number }[]> = {};
    const orderIds = ordersCompleted.map(o => o.id).filter(Boolean);
    let allTransactions: any[] = [];
    if (orderIds.length > 0) {
      const transactions = await this.drizzleService.db
        .select({
          orderId: userTransactions.orderId,
          method: userTransactions.method,
          amount: userTransactions.amount,
          status: userTransactions.status,
        })
        .from(userTransactions)
        .where(inArray(userTransactions.orderId, orderIds));
      allTransactions = transactions.filter(t => t.status === 'success');
      for (const t of allTransactions) {
        if (!paymentMap[t.orderId]) paymentMap[t.orderId] = [];
        paymentMap[t.orderId].push({ method: t.method, amount: Number(t.amount) });
      }
    }
    // Tổng hợp doanh thu theo phương thức
    let cashRevenue = 0;
    let zalopayRevenue = 0;
    const ordersWithNoTransaction = new Set(ordersCompleted.map(o => o.id));
    for (const [orderId, txs] of Object.entries(paymentMap)) {
      for (const tx of txs) {
        if (tx.method === 'cash') cashRevenue += tx.amount;
        else if (tx.method === 'zalopay') zalopayRevenue += tx.amount;
      }
      // Đánh dấu order đã có transaction
      ordersWithNoTransaction.delete(orderId);
    }
    // Cộng thêm các đơn chưa có transaction vào cash hoặc zalopay đúng phương thức
    for (const orderId of ordersWithNoTransaction) {
      const order = ordersCompleted.find(o => o.id === orderId);
      if (order) {
        if (order.appTransId) zalopayRevenue += Number(order.totalAmount || 0);
        else cashRevenue += Number(order.totalAmount || 0);
      }
    }
    let totalRevenue = cashRevenue + zalopayRevenue;
    // Fallback: nếu không có transaction thành công, dùng tổng tiền đơn hàng
    if (totalRevenue === 0 && ordersCompleted.length > 0) {
      totalRevenue = ordersCompleted.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
      cashRevenue = totalRevenue;
      zalopayRevenue = 0;
    }
    const totalOrders = ordersCompleted.length;
    const avgOrder = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;
    // Dữ liệu biểu đồ theo ngày
    const chartMap = new Map<string, { date: string; revenue: number; orders: number }>();
    for (const o of ordersCompleted) {
      const d = new Date(o.createdAt);
      const dateStr = d.toISOString().slice(0, 10);
      if (!chartMap.has(dateStr)) chartMap.set(dateStr, { date: dateStr, revenue: 0, orders: 0 });
      chartMap.get(dateStr).revenue += Number(o.totalAmount || 0);
      chartMap.get(dateStr).orders += 1;
    }
    const chartData = Array.from(chartMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    // Danh sách đơn hàng mẫu
    const ordersList = ordersCompleted.map(o => {
      let customer = '';
      const user = userMap[o.userId];
      if (user) {
        customer = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        if (!customer) customer = user.email || o.userId;
      } else {
        customer = o.userId;
      }
      // Lấy payment method lớn nhất (nếu có)
      let paymentMethod = '-';
      let maxAmount = 0;
      let transactionTotal = 0;
      if (paymentMap[o.id] && paymentMap[o.id].length > 0) {
        // Lấy transaction thành công có amount lớn nhất
        const maxTx = paymentMap[o.id].reduce((max, tx) => (tx.amount > max.amount ? tx : max), paymentMap[o.id][0]);
        paymentMethod = maxTx.method;
        maxAmount = maxTx.amount;
        transactionTotal = paymentMap[o.id].reduce((sum, tx) => sum + tx.amount, 0);
      } else if (o.appTransId) {
        paymentMethod = 'zalopay';
        transactionTotal = Number(o.totalAmount || 0);
      } else {
        paymentMethod = 'cash';
        transactionTotal = Number(o.totalAmount || 0);
      }
      return {
        id: o.orderNumber || o.id,
        date: new Date(o.createdAt).toISOString().slice(0, 10),
        customer,
        total: Number(o.totalAmount || 0),
        paymentMethod,
        transactionTotal,
      };
    });
    return {
      totalRevenue,
      totalOrders,
      avgOrder,
      chartData,
      orders: ordersList,
      cashRevenue,
      zalopayRevenue,
    };
  }
}
