import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

import { DishSnapshotRepository } from '~/database/repositories/dish_snapshot.repository';
import { DishRepository } from '~/database/repositories/dish.repository';
import { OrderRepository } from '~/database/repositories/order.repository';
import { UserRepository } from '~/database/repositories/user.repository';
import { Order } from '~/database/schema/orders';
import { userTransactions } from '~/database/schema/user_transactions';
import { NotificationGateway } from '../notification/notification.gateway';
import { TransactionMethod, TransactionStatus } from '../user_transaction/dto/create-user-transaction.dto';
import { UserTransactionService } from '../user_transaction/user-transaction.service';
import { CompleteOrderDto } from './dto/complete-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { FetchOrdersDto } from './dto/fetch-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger('OrderService');
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly dishRepository: DishRepository,
    private readonly dishSnapshotRepository: DishSnapshotRepository, // thêm dòng này
    private readonly userRepository: UserRepository,
    private notificationGateway: NotificationGateway,
    private readonly userTransactionService: UserTransactionService, // thêm dòng này
  ) {}

  async findAll(dto: FetchOrdersDto) {
    const result = await this.orderRepository.find(dto);
    const orders = result.data || [];

    // Lấy tất cả id admin tạo/cập nhật
    const adminIds = [
      ...new Set([...orders.map((o: Order) => o.createdBy).filter(Boolean), ...orders.map((o: Order) => o.updatedBy).filter(Boolean)]),
    ];

    // Lấy thông tin user
    const users = adminIds.length > 0 ? await this.userRepository.findManyByIds(adminIds) : [];
    const userMap = new Map(users.map(u => [u.id, `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || u.id]));

    // Lấy tất cả orderId để lấy transaction
    const orderIds = orders.map((o: any) => o.id);
    const transactionsByOrderId: Record<string, any> = {};
    if (orderIds.length > 0) {
      // Lấy tất cả transaction liên quan các order này
      const allTransactions = await this.userTransactionService.findByOrderIds(orderIds);
      // Group theo orderId
      for (const tx of allTransactions) {
        if (!transactionsByOrderId[tx.orderId]) transactionsByOrderId[tx.orderId] = [];
        transactionsByOrderId[tx.orderId].push(tx);
      }
    }

    // Thêm trường tên admin và method vào từng order
    const ordersWithAdminName = orders.map((order: any) => {
      let method = undefined;
      const txs = transactionsByOrderId[order.id] || [];
      // Ưu tiên transaction có status = 'success', nếu không có thì lấy transaction đầu tiên
      const successTx = txs.find((t: any) => t.status === 'success');
      if (successTx) method = successTx.method;
      else if (txs.length > 0) method = txs[0].method;
      return {
        ...order,
        createdByName: order.createdBy ? userMap.get(order.createdBy) : null,
        updatedByName: order.updatedBy ? userMap.get(order.updatedBy) : null,
        method,
      };
    });

    return {
      ...result,
      data: ordersWithAdminName,
    };
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne(id);
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    // Enrich từng item với thông tin sản phẩm
    const orderItems = (order.orderItems as { items: any[] } | undefined)?.items;
    if (orderItems && Array.isArray(orderItems)) {
      const enrichedItems = await Promise.all(
        orderItems.map(async item => {
          let name = '-';
          let image = '';
          let price = 0;
          let baseName = item.base;
          let toppingPrice = 0;
          // Ưu tiên lấy từ snapshot nếu có
          if (item.dishSnapshotId) {
            const snapshot = await this.dishSnapshotRepository.findOne(item.dishSnapshotId);
            if (snapshot) {
              name = snapshot.name || name;
              image = snapshot.imageUrl || image;
              price = Number(snapshot.basePrice) || price;
            }
          }
          // Nếu không có snapshot, lấy từ dish
          if ((!name || name === '-') && item.dishId) {
            const dish = await this.dishRepository.findOne(item.dishId);
            if (dish) {
              name = dish.name || name;
              image = dish.imageUrl || dish.image || image;
              price = Number(dish.basePrice) || price;
            }
          }
          // Nếu item.base là id topping, enrich tên và giá topping
          if (item.base && !['dày', 'mỏng'].includes(item.base)) {
            const topping = await this.dishRepository.findOne(item.base);
            if (topping) {
              baseName = topping.name;
              toppingPrice = Number(topping.basePrice) || 0;
            }
          }
          return {
            ...item,
            name,
            image,
            price,
            baseName,
            toppingPrice,
          };
        }),
      );
      (order.orderItems as { items: any[] }).items = enrichedItems;
    }
    // Bổ sung thông tin admin cập nhật đơn hàng
    let updatedByInfo = null;
    if (order.updatedBy) {
      const admin = await this.userRepository.findOne(order.updatedBy);
      if (admin) {
        updatedByInfo = {
          name: `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || admin.email,
          email: admin.email,
        };
      }
    }
    return {
      ...order,
      updatedByInfo,
      paymentMethod: order.zpTransToken || order.appTransId ? 'zalopay' : 'cash',
    };
  }

  async findOneByOrderNumber(orderNumber: number) {
    const order = await this.orderRepository.findOneByOrderNumber(orderNumber);
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    // Enrich từng item với thông tin sản phẩm (reuse logic từ findOne nếu muốn)
    return order;
  }

  async findOneByAppTransId(appTransId: string) {
    const order = await this.orderRepository.findOneByAppTransId(appTransId);
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    return {
      ...order,
      paymentMethod: order.zpTransToken || order.appTransId ? 'zalopay' : 'cash',
    };
  }

  async create(dto: CreateOrderDto) {
    // Validate type và deliveryAddress
    if (dto.type === 'delivery' && !dto.deliveryAddress) {
      throw new Error('Địa chỉ giao hàng là bắt buộc khi chọn hình thức giao hàng (delivery)');
    }
    // Đảm bảo mỗi item có id và enrich snapshot
    if (dto.orderItems && dto.orderItems.items) {
      dto.orderItems.items = await Promise.all(
        dto.orderItems.items.map(async item => {
          const dish = await this.dishRepository.findOne(item.dishId);
          // Tạo snapshot
          const validSizes = ['small', 'medium', 'large'];
          const validSize = item.size && validSizes.includes(item.size) ? item.size : null;
          // Tạo snapshot
          const snapshot = await this.dishSnapshotRepository.create({
            dishId: dish.id,
            name: dish.name,
            basePrice: dish.basePrice,
            description: dish.description,
            imageUrl: dish.imageUrl || dish.image, // tuỳ schema
            status: dish.status,
            size: validSize,
            typeName: dish.typeName,
            categoryId: dish.categoryId,
            createdBy: dish.createdBy,
            updatedBy: dish.updatedBy,
          });
          return {
            ...item,
            id: item.id || uuidv4(),
            dishSnapshotId: snapshot.id, // lưu id snapshot vào item
          };
        }),
      );
      // Tính tổng tiền giống frontend
      let total = 0;
      for (const item of dto.orderItems.items) {
        const dish = await this.dishRepository.findOne(item.dishId);
        let price = dish?.basePrice ? parseFloat(dish.basePrice) : 0;
        // Tính thêm giá size
        if (item.size) {
          if (item.size === 'medium') price += 90000;
          if (item.size === 'large') price += 190000;
        }
        // Tính thêm giá topping (nếu base là id topping)
        if (item.base && !['dày', 'mỏng'].includes(item.base)) {
          const topping = await this.dishRepository.findOne(item.base);
          if (topping) price += topping.basePrice ? parseFloat(topping.basePrice) : 0;
        }
        total += price * (item.quantity || 1);
      }
      if (dto.type === 'delivery') {
        total += 25000;
      }
      dto.totalAmount = total;
    }
    // Xử lý pickupTime cho đơn pickup
    let pickupTime: string | undefined = dto.pickupTime;
    if (dto.type === 'pickup' || dto.type === 'delivery') {
      if (!pickupTime) {
        // Nếu không truyền pickupTime, mặc định:
        // - pickup: +15 phút
        // - delivery: +30 phút
        const now = new Date();
        // Lấy thời gian UTC+7
        const vnOffset = 7 * 60; // phút
        const localNow = new Date(now.getTime() + (vnOffset - now.getTimezoneOffset()) * 60000);
        const addMinutes = dto.type === 'pickup' ? 15 : 30;
        const pickupDate = new Date(localNow.getTime() + addMinutes * 60000);
        const yyyy = pickupDate.getFullYear();
        const MM = String(pickupDate.getMonth() + 1).padStart(2, '0');
        const dd = String(pickupDate.getDate()).padStart(2, '0');
        const hh = String(pickupDate.getHours()).padStart(2, '0');
        const mm = String(pickupDate.getMinutes()).padStart(2, '0');
        pickupTime = `${yyyy}-${MM}-${dd} ${hh}:${mm}`;
      }
    } else {
      pickupTime = undefined;
    }
    // Chỉ truyền các trường hợp lệ vào DB
    const { note, appTransId, ...rest } = dto;
    this.logger?.log?.('orderRepository.create object:', { ...rest, appTransId });
    const order = await this.orderRepository.create({
      ...rest,
      appTransId, // đảm bảo luôn truyền appTransId
      orderItems: dto.orderItems, // đã có note trong từng item
      note: note, // nếu muốn lưu note tổng
      pickupTime,
    });
    // Lấy lại order từ DB để chắc chắn có trường orderNumber
    const orderFull = await this.orderRepository.findOne(order.id);

    // Lưu user_transaction với status phù hợp khi tạo đơn hàng
    if (orderFull && dto.userId) {
      await this.userTransactionService.create({
        userId: dto.userId,
        orderId: orderFull.id,
        amount: String(orderFull.totalAmount),
        method: dto.paymentMethod === 'zalopay' ? TransactionMethod.ZALOPAY : TransactionMethod.CASH,
        status: dto.paymentMethod === 'zalopay' ? TransactionStatus.SUCCESS : TransactionStatus.PENDING,
        transTime: new Date().toISOString(),
        transactionCode: null,
        description: `Tạo giao dịch cho đơn hàng #${orderFull.orderNumber}`,
      });
    }

    return {
      ...orderFull,
      order_number: orderFull.orderNumber,
    };
  }

  // Thêm hàm này để cập nhật đơn pending thành completed khi thanh toán
  async completeOrder(dto: CompleteOrderDto) {
    const { orderId, appTransId, zpTransToken } = dto;
    // 1. Tìm đơn hàng đang pending theo orderId hoặc appTransId
    let existingOrder = null;
    if (orderId) {
      existingOrder = await this.orderRepository.findFirst({
        where: (order, { eq, and }) => and(eq(order.id, orderId), eq(order.status, 'pending')),
      });
    } else if (appTransId) {
      existingOrder = await this.orderRepository.findFirst({
        where: (order, { eq, and }) => and(eq(order.appTransId, appTransId), eq(order.status, 'pending')),
      });
    }
    if (!existingOrder) {
      throw new Error('Không tìm thấy đơn hàng pending để hoàn tất');
    }
    // 2. Gửi yêu cầu xác minh thanh toán ZaloPay (nếu cần)
    // TODO: Add ZaloPay verification logic here if needed
    // 3. Cập nhật đơn hàng thành completed
    await this.orderRepository.update(existingOrder.id, {
      status: 'completed',
      updatedBy: existingOrder.userId,
    });
    return { message: 'Cập nhật trạng thái thành công', orderId: existingOrder.id };
  }

  async update(id: string, dto: UpdateOrderDto) {
    // Nếu chỉ cập nhật status, không validate các trường khác
    if (Object.keys(dto).length === 1 && dto.status) {
      const order = await this.orderRepository.findOne(id);
      if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
      if (['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'].includes(dto.status)) {
        order.status = dto.status as any;
      }
      const updatedOrder = await this.orderRepository.update(id, order as UpdateOrderDto);
      return {
        ...updatedOrder,
        order_number: updatedOrder?.orderNumber || updatedOrder?.id,
      };
    }
    // Validate type và deliveryAddress
    if (dto.type === 'delivery' && !dto.deliveryAddress) {
      throw new Error('Địa chỉ giao hàng là bắt buộc khi chọn hình thức giao hàng (delivery)');
    }
    // Lấy order hiện tại
    const order = await this.orderRepository.findOne(id);
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    // Nếu có orderItems thì cập nhật quantity tuyệt đối từng item
    if (dto.orderItems && dto.orderItems.items) {
      // Đảm bảo mỗi item có id
      dto.orderItems.items = dto.orderItems.items.map(item => ({
        ...item,
        id: item.id || uuidv4(),
      }));
      const newItems = dto.orderItems.items;
      const currentItems = (order.orderItems as { items: any[] })?.items || [];
      for (const newItem of newItems) {
        const idx = currentItems.findIndex(
          (i: any) => i.dishId === newItem.dishId && i.size === newItem.size && i.base === newItem.base && i.note === newItem.note,
        );
        if (idx > -1) {
          // Cập nhật quantity tuyệt đối, KHÔNG cập nhật tên món đã snapshot
          currentItems[idx].quantity = newItem.quantity;
          currentItems[idx].id = newItem.id; // Đảm bảo id đồng bộ
        } else {
          // Nếu là item mới, tạo snapshot mới cho item này
          const dish = await this.dishRepository.findOne(newItem.dishId);
          const validSizes = ['small', 'medium', 'large'];
          const validSize = newItem.size && validSizes.includes(newItem.size) ? newItem.size : null;
          const snapshot = await this.dishSnapshotRepository.create({
            dishId: dish.id,
            name: dish.name,
            basePrice: dish.basePrice,
            description: dish.description,
            imageUrl: dish.imageUrl || dish.image,
            status: dish.status,
            size: validSize,
            typeName: dish.typeName,
            categoryId: dish.categoryId,
            createdBy: dish.createdBy,
            updatedBy: dish.updatedBy,
          });
          currentItems.push({ ...newItem, dishSnapshotId: snapshot.id });
        }
      }
      // Loại bỏ item có quantity <= 0
      order.orderItems = { items: currentItems.filter((i: any) => i.quantity > 0) };
      // Tính lại tổng tiền
      let total = 0;
      for (const item of (order.orderItems as { items: any[] }).items) {
        // Lấy giá từ snapshot nếu có
        let price = 0;
        if (item.dishSnapshotId) {
          const snapshot = await this.dishSnapshotRepository.findOne(item.dishSnapshotId);
          price = snapshot?.basePrice ? parseFloat(snapshot.basePrice as any) : 0;
        } else {
          const dish = await this.dishRepository.findOne(item.dishId);
          price = dish?.basePrice ? parseFloat(dish.basePrice) : 0;
        }
        total += price * (item.quantity || 1);
      }
      if (order.type === 'delivery') {
        total += 25000;
      }
      order.totalAmount = total.toString();
    }

    // Cập nhật các trường khác nếu có
    if (dto.status && ['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'].includes(dto.status)) {
      order.status = dto.status as any;
    }
    if (dto.type && ['pickup', 'delivery'].includes(dto.type)) {
      order.type = dto.type as any;
    }
    if (dto.isActive !== undefined) order.isActive = dto.isActive;

    // Đảm bảo deliveryAddress đúng cấu trúc nếu type là delivery
    if (order.type === 'delivery') {
      const deliveryAddress = (dto.deliveryAddress ?? order.deliveryAddress) as { address: string; phone: string; name?: string };
      if (deliveryAddress && deliveryAddress.address && deliveryAddress.phone) {
        order.deliveryAddress = deliveryAddress;
      } else {
        throw new Error('Thiếu thông tin địa chỉ giao hàng (address, phone)');
      }
    }

    // Lưu updatedBy nếu có
    if (dto.updatedBy) {
      order.updatedBy = dto.updatedBy;
    }
    // Lưu lại order
    const updatedOrder = await this.orderRepository.update(id, order as UpdateOrderDto);

    // Nếu cập nhật status và có updatedBy (admin), thì update user_transaction
    if (dto.status && dto.updatedBy && order.userId) {
      // Chỉ cập nhật transaction cash sang success khi order completed
      if (dto.status === 'completed') {
        // Lấy tất cả transaction của order
        const transactions = await this.userTransactionService.findByOrderId(order.id);
        for (const tx of transactions) {
          if (tx.method === 'cash') {
            await this.userTransactionService.updateByOrderId(order.id, {
              status: TransactionStatus.SUCCESS,
              transTime: new Date().toISOString(),
              description: `Admin xác nhận hoàn thành đơn hàng #${order.orderNumber || order.id}`,
            });
          }
        }
      } else {
        // Xác định status mới cho transaction
        let newStatus = TransactionStatus.PENDING;
        if (dto.status === 'confirmed') newStatus = TransactionStatus.SUCCESS;
        if (dto.status === 'cancelled') newStatus = TransactionStatus.CANCELLED;
        // Update user_transaction theo orderId
        await this.userTransactionService.updateByOrderId(order.id, {
          status: newStatus,
          transTime: new Date().toISOString(),
          description: `Admin cập nhật trạng thái đơn hàng #${order.orderNumber || order.id} sang ${dto.status}`,
        });
      }
    }

    return {
      ...updatedOrder,
      order_number: updatedOrder?.orderNumber || updatedOrder?.id,
    };
  }

  async delete(id: string, currentUserId: string) {
    // Có thể kiểm tra quyền user ở đây nếu cần
    return this.orderRepository.hardDelete(id);
  }

  async deleteHard(id: string) {
    return this.orderRepository.hardDelete(id);
  }

  async confirmOrder(dto: CreateOrderDto) {
    this.logger.log('confirmOrder called with dto:', JSON.stringify(dto, null, 2));

    // BƯỚC 1: Tạo đơn hàng trong database với status 'pending' (không tạo user_transaction)
    const order = await this.createOrderWithoutTransaction({
      ...dto,
      status: 'pending', // Đảm bảo status là pending
    });

    this.logger.log('Order created:', order.id, order.orderNumber);

    // BƯỚC 2: Tạo đơn hàng ZaloPay
    const { ZaloPayService } = await import('../payment/zalopay.service');
    const zaloPayService = new ZaloPayService();

    const orderInfo = {
      userId: dto.userId,
      orderItems: dto.orderItems,
      totalAmount: dto.totalAmount,
      type: dto.type,
      deliveryAddress: dto.deliveryAddress,
      note: dto.note || '',
    };

    try {
      const zalopayResult = await zaloPayService.createOrder(
        Number(dto.totalAmount),
        order.orderNumber?.toString() || order.id,
        `Thanh toán đơn hàng #${order.orderNumber || order.id}`,
        orderInfo,
      );

      // BƯỚC 3: Cập nhật đơn hàng với thông tin ZaloPay
      if (zalopayResult.return_code === 1) {
        await this.orderRepository.update(order.id, {
          appTransId: zalopayResult.app_trans_id,
          zpTransToken: zalopayResult.zp_trans_token,
          status: 'pending',
        } as any);

        // Tạo user_transaction sau khi đã có thông tin ZaloPay
        if (order.userId) {
          await this.userTransactionService.create({
            userId: order.userId,
            orderId: order.id,
            amount: String(order.totalAmount),
            method: TransactionMethod.ZALOPAY,
            status: TransactionStatus.PENDING,
            transTime: new Date().toISOString(),
            transactionCode: zalopayResult.zp_trans_token || '',
            description: `Tạo giao dịch ZaloPay cho đơn hàng #${order.orderNumber}`,
          });
        }

        const result = {
          orderId: order.id,
          orderNumber: order.orderNumber,
          order_url: zalopayResult.order_url,
          qrcode: zalopayResult.qrcode,
          app_trans_id: zalopayResult.app_trans_id,
          zp_trans_token: zalopayResult.zp_trans_token,
          return_code: zalopayResult.return_code,
          return_message: zalopayResult.return_message,
        };

        this.logger.log('confirmOrder returning result:', JSON.stringify(result, null, 2));
        return result;
      } else {
        throw new Error(zalopayResult.return_message || 'Tạo đơn hàng ZaloPay thất bại');
      }
    } catch (error) {
      // Nếu tạo ZaloPay thất bại, xóa đơn hàng đã tạo
      await this.orderRepository.hardDelete(order.id);
      throw error;
    }
  }

  // Tạo method riêng để tạo đơn hàng không tạo user_transaction
  private async createOrderWithoutTransaction(dto: CreateOrderDto) {
    // Nếu có appTransId, kiểm tra trùng
    if (dto.appTransId) {
      const existed = await this.orderRepository.findOneByAppTransId(dto.appTransId);
      if (existed) return existed;
    }

    // Kiểm tra đơn hàng pending gần đây (trong 5 phút) để tránh tạo trùng
    if (dto.userId) {
      const recentOrders = await this.orderRepository.find({
        userId: dto.userId,
        status: ['pending'],
        limit: 5,
        offset: 0,
      });

      const FIVE_MINUTES = 5 * 60 * 1000;
      const now = Date.now();
      const recentPendingOrder = recentOrders.data?.find(order => {
        const orderTime = new Date(order.createdAt).getTime();
        return now - orderTime < FIVE_MINUTES;
      });

      if (recentPendingOrder) {
        this.logger.log('Tìm thấy đơn hàng pending gần đây, trả về đơn hàng đó:', recentPendingOrder.id);
        return recentPendingOrder;
      }
    }

    // Validate type và deliveryAddress
    if (dto.type === 'delivery' && !dto.deliveryAddress) {
      throw new Error('Địa chỉ giao hàng là bắt buộc khi chọn hình thức giao hàng (delivery)');
    }
    // Đảm bảo mỗi item có id và enrich snapshot
    if (dto.orderItems && dto.orderItems.items) {
      dto.orderItems.items = await Promise.all(
        dto.orderItems.items.map(async item => {
          const dish = await this.dishRepository.findOne(item.dishId);
          // Tạo snapshot
          const validSizes = ['small', 'medium', 'large'];
          const validSize = item.size && validSizes.includes(item.size) ? item.size : null;
          // Tạo snapshot
          const snapshot = await this.dishSnapshotRepository.create({
            dishId: dish.id,
            name: dish.name,
            basePrice: dish.basePrice,
            description: dish.description,
            imageUrl: dish.imageUrl || dish.image, // tuỳ schema
            status: dish.status,
            size: validSize,
            typeName: dish.typeName,
            categoryId: dish.categoryId,
            createdBy: dish.createdBy,
            updatedBy: dish.updatedBy,
          });
          return {
            ...item,
            id: item.id || uuidv4(),
            dishSnapshotId: snapshot.id, // lưu id snapshot vào item
          };
        }),
      );
      // Tính tổng tiền giống frontend
      let total = 0;
      for (const item of dto.orderItems.items) {
        const dish = await this.dishRepository.findOne(item.dishId);
        let price = dish?.basePrice ? parseFloat(dish.basePrice) : 0;
        // Tính thêm giá size
        if (item.size) {
          if (item.size === 'medium') price += 90000;
          if (item.size === 'large') price += 190000;
        }
        // Tính thêm giá topping (nếu base là id topping)
        if (item.base && !['dày', 'mỏng'].includes(item.base)) {
          const topping = await this.dishRepository.findOne(item.base);
          if (topping) price += topping.basePrice ? parseFloat(topping.basePrice) : 0;
        }
        total += price * (item.quantity || 1);
      }
      if (dto.type === 'delivery') {
        total += 25000;
      }
      dto.totalAmount = total;
    }
    // Xử lý pickupTime cho đơn pickup
    let pickupTime: string | undefined = dto.pickupTime;
    if (dto.type === 'pickup' || dto.type === 'delivery') {
      if (!pickupTime) {
        // Nếu không truyền pickupTime, mặc định:
        // - pickup: +15 phút
        // - delivery: +30 phút
        const now = new Date();
        // Lấy thời gian UTC+7
        const vnOffset = 7 * 60; // phút
        const localNow = new Date(now.getTime() + (vnOffset - now.getTimezoneOffset()) * 60000);
        const addMinutes = dto.type === 'pickup' ? 15 : 30;
        const pickupDate = new Date(localNow.getTime() + addMinutes * 60000);
        const yyyy = pickupDate.getFullYear();
        const MM = String(pickupDate.getMonth() + 1).padStart(2, '0');
        const dd = String(pickupDate.getDate()).padStart(2, '0');
        const hh = String(pickupDate.getHours()).padStart(2, '0');
        const mm = String(pickupDate.getMinutes()).padStart(2, '0');
        pickupTime = `${yyyy}-${MM}-${dd} ${hh}:${mm}`;
      }
    } else {
      pickupTime = undefined;
    }
    // Chỉ truyền các trường hợp lệ vào DB
    const { note, appTransId, ...rest } = dto;
    this.logger?.log?.('orderRepository.create object:', { ...rest, appTransId });
    const order = await this.orderRepository.create({
      ...rest,
      appTransId, // đảm bảo luôn truyền appTransId
      orderItems: dto.orderItems, // đã có note trong từng item
      note: note, // nếu muốn lưu note tổng
      pickupTime,
    });
    // Lấy lại order từ DB để chắc chắn có trường orderNumber
    const orderFull = await this.orderRepository.findOne(order.id);

    return {
      ...orderFull,
      order_number: orderFull.orderNumber,
    };
  }
}
