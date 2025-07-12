import { Injectable } from '@nestjs/common';
import { OrderRepository } from '~/database/repositories/order.repository';
import { UserRepository } from '~/database/repositories/user.repository';

@Injectable()
export class ReportsService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly userRepository: UserRepository,
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
    // Tổng hợp
    const totalRevenue = ordersCompleted.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const totalOrders = ordersCompleted.length;
    const avgOrder = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;
    // Dữ liệu biểu đồ theo ngày
    const chartMap = new Map<string, { date: string, revenue: number, orders: number }>();
    for (const o of ordersCompleted) {
      const d = new Date(o.createdAt);
      const dateStr = d.toISOString().slice(0, 10);
      if (!chartMap.has(dateStr)) chartMap.set(dateStr, { date: dateStr, revenue: 0, orders: 0 });
      chartMap.get(dateStr)!.revenue += Number(o.totalAmount || 0);
      chartMap.get(dateStr)!.orders += 1;
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
      return {
        id: o.orderNumber || o.id,
        date: new Date(o.createdAt).toISOString().slice(0, 10),
        customer,
        total: Number(o.totalAmount || 0),
      };
    });
    return {
      totalRevenue,
      totalOrders,
      avgOrder,
      chartData,
      orders: ordersList,
    };
  }
} 