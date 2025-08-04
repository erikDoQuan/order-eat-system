import { forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

import { DishSnapshotRepository } from '~/database/repositories/dish_snapshot.repository';
import { DishRepository } from '~/database/repositories/dish.repository';
import { OrderRepository } from '~/database/repositories/order.repository';
import { UserRepository } from '~/database/repositories/user.repository';
import { Order } from '~/database/schema/orders';
import { userTransactions } from '~/database/schema/user_transactions';
import { EmailService } from '../email/email.service';
import { NotificationGateway } from '../notification/notification.gateway';
// import { ZaloPayService } from '../payment/zalopay.service';
import { TransactionMethod, TransactionStatus } from '../user_transaction/dto/create-user-transaction.dto';
import { UserTransactionService } from '../user_transaction/user-transaction.service';
import { CompleteOrderDto } from './dto/complete-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { FetchOrdersDto } from './dto/fetch-order.dto';
import { CANCELLATION_REASON_VALUES, UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger('OrderService');
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly dishRepository: DishRepository,
    private readonly dishSnapshotRepository: DishSnapshotRepository, // thêm dòng này
    private readonly userRepository: UserRepository,
    private notificationGateway: NotificationGateway,
    public readonly userTransactionService: UserTransactionService, // thêm dòng này
    private readonly emailService: EmailService,
    @Inject('ZALOPAY_SERVICE')
    private readonly zaloPayService: any,
  ) {}

  // Helper function để enrich order items với snapshot
  private async enrichOrderItems(orderItems: any[]) {
    return Promise.all(
      orderItems.map(async item => {
        let name = '-';
        let image = '';
        let price = 0;
        let baseName = item.base;
        let toppingPrice = 0;
        let description = '';

        // BẮT BUỘC lấy từ snapshot nếu có dishSnapshotId
        if (item.dishSnapshotId) {
          console.log('🔍 Looking for snapshot:', item.dishSnapshotId);
          const snapshot = await this.dishSnapshotRepository.findOne(item.dishSnapshotId);
          if (snapshot) {
            console.log('🔍 Found snapshot:', {
              id: snapshot.id,
              name: snapshot.name,
              basePrice: snapshot.basePrice,
              price: Number(snapshot.basePrice),
            });
            name = snapshot.name || name;
            image = snapshot.imageUrl || image;
            price = Number(snapshot.basePrice) || price;
            description = snapshot.description || description;
          } else {
            console.log('❌ Snapshot not found:', item.dishSnapshotId);
          }
        }

        // Nếu không có snapshot, thử lấy từ item data trước
        if (!item.dishSnapshotId) {
          name = item.name || name;
          image = item.image || image;
          price = item.price !== undefined ? Number(item.price) : price;
          description = item.description || description;

          // Nếu vẫn không có thông tin, fallback về dish hiện tại để đảm bảo hiển thị được
          if ((!name || name === '-') && item.dishId) {
            console.log('🔍 Fallback to current dish for display:', item.dishId);
            const currentDish = await this.dishRepository.findOne(item.dishId);
            if (currentDish) {
              console.log('🔍 Found current dish for fallback:', currentDish.name);
              name = currentDish.name || name;
              image = currentDish.imageUrl || currentDish.image || image;
              price = Number(currentDish.basePrice) || price;
              description = currentDish.description || description;
            } else {
              console.log('❌ Current dish not found for fallback:', item.dishId);
            }
          }
        } else {
          // Nếu có snapshot, KHÔNG fallback về dish hiện tại
          console.log('🔍 Using snapshot data, no fallback to current dish');
        }

        // Nếu item.base là id topping, enrich tên và giá topping
        if (item.base && !['dày', 'mỏng'].includes(item.base)) {
          const topping = await this.dishRepository.findOne(item.base);
          if (topping) {
            baseName = topping.name;
            toppingPrice = Number(topping.basePrice) || 0;
          }
        }

        // Log topping enrichment
        if (item.base && !['dày', 'mỏng'].includes(item.base)) {
          console.log('🔍 Topping enrichment:', {
            base: item.base,
            baseName,
            toppingPrice,
          });
        }

        const result = {
          ...item,
          name,
          image,
          price,
          baseName,
          toppingPrice,
          description,
        };

        console.log('🔍 Final item result:', {
          dishId: item.dishId,
          dishSnapshotId: item.dishSnapshotId,
          name: result.name,
          price: result.price,
          originalPrice: item.price,
          snapshotPrice: item.dishSnapshotId ? 'from snapshot' : 'no snapshot',
          hasName: !!result.name && result.name !== '-',
          hasPrice: !!result.price && result.price > 0,
          finalPrice: result.price,
          priceSource: item.dishSnapshotId ? 'snapshot' : item.price ? 'item' : 'fallback',
        });

        return result;
      }),
    );
  }

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

    // Enrich từng order với thông tin sản phẩm từ snapshot
    const ordersWithEnrichedItems = await Promise.all(
      orders.map(async (order: any) => {
        // Enrich order items với snapshot
        const orderItems = (order.orderItems as { items: any[] } | undefined)?.items;
        console.log('🔍 findAll - Order items before enrich:', JSON.stringify(orderItems, null, 2));
        if (orderItems && Array.isArray(orderItems)) {
          const enrichedItems = await this.enrichOrderItems(orderItems);
          console.log('🔍 findAll - Order items after enrich:', JSON.stringify(enrichedItems, null, 2));
          order.orderItems = { items: enrichedItems };
        }

        // Thêm trường tên admin và method
        let method = undefined;
        const txs = transactionsByOrderId[order.id] || [];
        const successTx = txs.find((t: any) => t.status === 'success');
        if (successTx) method = successTx.method;
        else if (txs.length > 0) method = txs[0].method;

        return {
          ...order,
          createdByName: order.createdBy ? userMap.get(order.createdBy) : null,
          updatedByName: order.updatedBy ? userMap.get(order.updatedBy) : null,
          method,
        };
      }),
    );

    return {
      ...result,
      data: ordersWithEnrichedItems,
    };
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne(id);
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    // Enrich thông tin user
    let userInfo = null;
    if (order.userId) {
      const user = await this.userRepository.findOne(order.userId);
      if (user) {
        userInfo = {
          id: user.id,
          email: user.email,
          phone: (user as any).phone,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        };
      }
    }

    // Enrich từng item với thông tin sản phẩm
    const orderItems = (order.orderItems as { items: any[] } | undefined)?.items;
    console.log('🔍 findOne - Order items before enrich:', JSON.stringify(orderItems, null, 2));
    if (orderItems && Array.isArray(orderItems)) {
      // Log dishSnapshotId của từng item
      orderItems.forEach((item, index) => {
        console.log(`🔍 findOne - Item ${index}:`, {
          dishId: item.dishId,
          dishSnapshotId: item.dishSnapshotId,
          name: item.name,
          price: item.price,
          hasSnapshot: !!item.dishSnapshotId,
          hasName: !!item.name && item.name !== '-',
          hasPrice: !!item.price && item.price > 0,
        });
      });

      const enrichedItems = await this.enrichOrderItems(orderItems);
      console.log('🔍 findOne - Order items after enrich:', JSON.stringify(enrichedItems, null, 2));
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
      user: userInfo,
      updatedByInfo,
      paymentMethod: order.zpTransToken || order.appTransId ? 'zalopay' : 'cash',
      order_number: order.orderNumber || `#${order.id.slice(0, 8)}`,
      orderNumber: order.orderNumber || `#${order.id.slice(0, 8)}`,
    };
  }

  async findOneByOrderNumber(orderNumber: number) {
    const order = await this.orderRepository.findOneByOrderNumber(orderNumber);
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    // Enrich từng item với thông tin sản phẩm từ snapshot
    const orderItems = (order.orderItems as { items: any[] } | undefined)?.items;
    if (orderItems && Array.isArray(orderItems)) {
      const enrichedItems = await this.enrichOrderItems(orderItems);
      (order.orderItems as { items: any[] }).items = enrichedItems;
    }

    return {
      ...order,
      order_number: order.orderNumber || `#${order.id.slice(0, 8)}`,
      orderNumber: order.orderNumber || `#${order.id.slice(0, 8)}`,
    };
  }

  async findOneByAppTransId(appTransId: string) {
    console.log('🔎 Tìm đơn hàng theo appTransId:', appTransId);
    const order = await this.orderRepository.findOneByAppTransId(appTransId);
    if (!order) {
      console.log('❌ Không tìm thấy đơn hàng với appTransId:', appTransId);
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    // Enrich thông tin user
    let userInfo = null;
    if (order.userId) {
      try {
        const user = await this.userRepository.findOne(order.userId);
        if (user) {
          userInfo = {
            id: user.id,
            email: user.email,
            phone: (user as any).phone,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          };
        }
      } catch (error) {
        console.error('❌ Error enriching user info:', error);
      }
    }

    // Enrich từng item với thông tin sản phẩm (giống findOne)
    const orderItems = (order.orderItems as { items: any[] } | undefined)?.items;
    if (orderItems && Array.isArray(orderItems)) {
      try {
        const enrichedItems = await this.enrichOrderItems(orderItems);
        (order.orderItems as { items: any[] }).items = enrichedItems;
      } catch (error) {
        console.error('❌ Error enriching order items:', error);
        // Không throw error, giữ nguyên order items
      }
    }

    // Trả về đầy đủ các trường, đặc biệt là status
    console.log('✅ Đã tìm thấy đơn hàng:', JSON.stringify(order, null, 2));
    console.log('🔍 Order number from DB:', order.orderNumber);
    console.log('🔍 Order ID:', order.id);

    return {
      ...order,
      user: userInfo,
      paymentMethod: order.zpTransToken || order.appTransId ? 'zalopay' : 'cash',
      order_number: order.orderNumber || `#${order.id.slice(0, 8)}`,
      orderNumber: order.orderNumber || `#${order.id.slice(0, 8)}`,
    };
  }

  async create(dto: CreateOrderDto) {
    // Validate type và deliveryAddress
    if (dto.type === 'delivery' && !dto.deliveryAddress) {
      throw new Error('Địa chỉ giao hàng là bắt buộc khi chọn hình thức giao hàng (delivery)');
    }

    // Validate deliveryAddress có đủ thông tin khi type là delivery
    if (dto.type === 'delivery' && dto.deliveryAddress) {
      if (!dto.deliveryAddress.address || !dto.deliveryAddress.phone) {
        throw new Error('Địa chỉ giao hàng phải có đầy đủ địa chỉ và số điện thoại');
      }
    }

    // Đảm bảo có userId
    if (!dto.userId) {
      throw new Error('UserId is required');
    }
    // Đảm bảo mỗi item có id và enrich snapshot
    if (dto.orderItems && dto.orderItems.items) {
      console.log('🔍 Creating order with items:', dto.orderItems.items.length);
      dto.orderItems.items = await Promise.all(
        dto.orderItems.items.map(async item => {
          const dish = await this.dishRepository.findOne(item.dishId);
          if (!dish) {
            throw new Error(`Dish not found with id: ${item.dishId}`);
          }
          // Tạo snapshot
          const validSizes = ['small', 'medium', 'large'];
          const validSize = item.size && validSizes.includes(item.size) ? item.size : null;
          // Tạo snapshot
          console.log('🔍 Creating snapshot for dish:', {
            dishId: dish.id,
            name: dish.name,
            basePrice: dish.basePrice,
            createdBy: dish.createdBy || dto.userId,
            updatedBy: dish.updatedBy || dto.userId,
          });

          let snapshotId = null;

          try {
            console.log('🔍 Attempting to create snapshot for dish:', dish.id);

            // Validate required fields
            if (!dish.id) {
              throw new Error('Dish ID is required');
            }
            if (!dto.userId) {
              throw new Error('User ID is required');
            }

            const snapshotData = {
              dishId: dish.id,
              name: dish.name || 'Unknown Dish',
              basePrice: dish.basePrice || '0',
              imageUrl: dish.imageUrl || dish.image || null,
              status: dish.status || 'available',
              size: validSize,
              typeName: dish.typeName || null,
              categoryId: dish.categoryId || null,
              createdBy: dto.userId || null,
              updatedBy: dto.userId || null,
            } as any;

            console.log('🔍 Snapshot data:', snapshotData);
            const snapshot = await this.dishSnapshotRepository.create(snapshotData);

            snapshotId = snapshot.id;
            console.log('🔍 Snapshot created successfully:', snapshotId);
          } catch (error) {
            console.error('❌ Error creating snapshot:', error);
            console.error('❌ Error details:', {
              message: error.message,
              stack: error.stack,
              dishId: dish.id,
              userId: dto.userId,
            });
            // Không throw error, chỉ log và tiếp tục với snapshotId = null
            console.log('⚠️ Continuing without snapshot for dish:', dish.id);
          }

          const enrichedItem = {
            ...item,
            id: item.id || uuidv4(),
            dishSnapshotId: snapshotId, // lưu id snapshot vào item
            // Thêm thông tin từ dish để đảm bảo hiển thị được
            name: dish.name || 'Unknown Dish',
            price: dish.basePrice || '0',
            image: dish.imageUrl || dish.image || null,
            description: dish.description || null,
          };

          console.log('🔍 Enriched item created:', {
            dishId: enrichedItem.dishId,
            dishSnapshotId: enrichedItem.dishSnapshotId,
            name: enrichedItem.name,
            price: enrichedItem.price,
            hasSnapshot: !!enrichedItem.dishSnapshotId,
            hasName: !!enrichedItem.name && enrichedItem.name !== '-',
            hasPrice: !!enrichedItem.price && enrichedItem.price > 0,
          });

          return enrichedItem;
        }),
      );

      console.log(
        '🔍 Order items after snapshot creation:',
        dto.orderItems.items.map(item => ({
          dishId: item.dishId,
          dishSnapshotId: item.dishSnapshotId,
          name: item.name,
          price: item.price,
        })),
      );
      console.log('🔍 Full order items data:', JSON.stringify(dto.orderItems, null, 2));
      console.log(
        '🔍 Order items with snapshot IDs:',
        dto.orderItems.items.map(item => ({
          dishId: item.dishId,
          dishSnapshotId: item.dishSnapshotId,
          name: item.name,
          price: item.price,
          hasSnapshot: !!item.dishSnapshotId,
          hasName: !!item.name && item.name !== '-',
          hasPrice: !!item.price && item.price > 0,
        })),
      );
      // Tính tổng tiền từ item đã enrich (không lấy từ dish hiện tại)
      let total = 0;
      for (const item of dto.orderItems.items) {
        // Sử dụng giá từ item đã enrich
        let price = Number(item.price) || 0;

        // Tính thêm giá size
        if (item.size) {
          if (item.size === 'medium') price += 90000;
          if (item.size === 'large') price += 190000;
        }

        // Tính thêm giá topping (nếu có toppingPrice đã enrich)
        if (item.toppingPrice !== undefined) {
          price += Number(item.toppingPrice);
        } else if (item.base && !['dày', 'mỏng'].includes(item.base)) {
          // Fallback: lấy từ dish hiện tại nếu chưa enrich toppingPrice
          const topping = await this.dishRepository.findOne(item.base);
          if (topping) price += topping.basePrice ? parseFloat(topping.basePrice) : 0;
        }

        total += price * (item.quantity || 1);
        console.log('🔍 Item price calculation:', {
          dishId: item.dishId,
          itemPrice: item.price,
          calculatedPrice: price,
          quantity: item.quantity,
          subtotal: price * (item.quantity || 1),
        });
      }
      if (dto.type === 'delivery') {
        total += 25000;
      }
      dto.totalAmount = total;
      console.log('🔍 Total amount calculated:', total);
    }
    // Xử lý note cho đơn hàng
    let note = dto.note || '';
    if (dto.type === 'pickup') {
      note = `Đơn hàng mang về - ${note}`.trim();
    } else if (dto.type === 'delivery') {
      note = `Đơn hàng giao tận nơi - ${note}`.trim();
    }

    // Tạo appTransId nếu có
    const appTransId = dto.appTransId || undefined;

    // Log dữ liệu trước khi tạo
    console.log(
      '📦 Creating order with data:',
      JSON.stringify(
        {
          userId: dto.userId,
          type: dto.type,
          totalAmount: dto.totalAmount,
          status: dto.status,
          appTransId,
          orderItems: dto.orderItems,
          note,
        },
        null,
        2,
      ),
    );

    // Tạo đơn hàng
    const order = await this.orderRepository.create({
      userId: dto.userId,
      type: dto.type,
      orderItems: dto.orderItems,
      totalAmount: dto.totalAmount,
      status: dto.status,
      createdBy: dto.createdBy,
      deliveryAddress: dto.deliveryAddress,
      appTransId,
      note,
    });
    console.log('🔍 Order created successfully:', order.id);
    console.log('🔍 Created order status:', order.status);
    // Lấy lại order từ DB để chắc chắn có trường orderNumber
    const orderFull = await this.orderRepository.findOne(order.id);
    console.log('🔍 Retrieved order status from DB:', orderFull?.status);
    // Log appTransId và orderFull để debug
    console.log('AppTransId:', appTransId);
    console.log('Saved Order:', JSON.stringify(orderFull, null, 2));
    console.log('🔍 Order items from DB:', JSON.stringify(orderFull?.orderItems, null, 2));
    console.log(
      '🔍 Order items in saved order:',
      (orderFull?.orderItems as any)?.items?.map((item: any) => ({
        dishId: item.dishId,
        dishSnapshotId: item.dishSnapshotId,
        name: item.name,
        price: item.price,
        hasSnapshot: !!item.dishSnapshotId,
        hasName: !!item.name && item.name !== '-',
        hasPrice: !!item.price && item.price > 0,
      })),
    );

    // Lưu user_transaction với status phù hợp khi tạo đơn hàng
    if (orderFull && dto.userId) {
      await this.userTransactionService.create({
        userId: dto.userId,
        orderId: orderFull.id,
        amount: String(orderFull.totalAmount),
        method: TransactionMethod.CASH, // Mặc định là CASH
        status: TransactionStatus.PENDING, // Mặc định là PENDING
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
    // 1. Tìm đơn hàng pending theo appTransId
    let existingOrder = null;
    if (dto.appTransId) {
      existingOrder = await this.orderRepository.findOneByAppTransId(dto.appTransId);
    } else {
      existingOrder = await this.orderRepository.findOne(dto.orderId);
    }
    if (!existingOrder) {
      throw new Error('Không tìm thấy đơn hàng pending để hoàn tất');
    }

    // 2. Gửi yêu cầu xác minh thanh toán ZaloPay (nếu cần)
    // TODO: Add ZaloPay verification logic here if needed

    // 3. Cập nhật đơn hàng thành completed (chỉ cho cash orders, không cho ZaloPay)
    const updateData: any = {
      updatedBy: existingOrder.userId,
    };

    // Không bao giờ cập nhật order status thành completed cho ZaloPay orders
    // Chỉ cập nhật cho cash orders (không có appTransId)
    if (!existingOrder.appTransId && !existingOrder.zpTransToken) {
      updateData.status = 'completed';
      console.log('✅ Cập nhật order status thành completed cho cash order');
    } else {
      console.log('ℹ️ Giữ nguyên order status cho ZaloPay order (có appTransId hoặc zpTransToken)');
    }

    await this.orderRepository.update(existingOrder.id, updateData);

    // 4. Gửi email thông báo thanh toán thành công
    try {
      // Lấy thông tin user
      const user = await this.userRepository.findOne(existingOrder.userId);
      if (user?.email) {
        // Enrich order data với items
        const enrichedOrder = await this.findOne(existingOrder.id);
        const customerName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email || 'Quý khách';

        await this.emailService.sendPaymentSuccessEmail(user.email, enrichedOrder, customerName);
        this.logger.log(`Payment success email sent to ${user.email} for order ${existingOrder.id}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send payment success email: ${error.message}`);
      // Không throw error để không ảnh hưởng đến flow chính
    }

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
            imageUrl: dish.imageUrl || dish.image,
            status: dish.status,
            size: validSize,
            typeName: dish.typeName,
            categoryId: dish.categoryId,
            createdBy: dish.createdBy,
            updatedBy: dish.updatedBy,
          } as any);
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
      // Nếu status là cancelled và có cancellationReason, lưu lý do hủy
      if (dto.status === 'cancelled' && dto.cancellationReason) {
        order.cancellationReason = dto.cancellationReason as any;
        console.log('🔍 Setting cancellationReason:', dto.cancellationReason);
      }
    }
    if (dto.type && ['pickup', 'delivery'].includes(dto.type)) {
      order.type = dto.type as any;
    }
    if (dto.isActive !== undefined) order.isActive = dto.isActive;

    // Đảm bảo deliveryAddress đúng cấu trúc nếu type là delivery
    // Chỉ validate khi có thay đổi deliveryAddress hoặc type
    if (order.type === 'delivery' && (dto.deliveryAddress || dto.type)) {
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
    console.log('🔍 Updating order with data:', {
      id,
      status: order.status,
      cancellationReason: order.cancellationReason,
    });

    // Đảm bảo cancellationReason được gửi đúng
    const updateData = { ...order } as UpdateOrderDto;
    if (order.status === 'cancelled' && order.cancellationReason) {
      updateData.cancellationReason = order.cancellationReason;
      console.log('🔍 Explicitly setting cancellationReason:', order.cancellationReason);
    }

    const updatedOrder = await this.orderRepository.update(id, updateData);
    console.log('🔍 Updated order result:', {
      id: updatedOrder?.id,
      status: updatedOrder?.status,
      cancellationReason: updatedOrder?.cancellationReason,
    });

    // Kiểm tra lại từ database để đảm bảo dữ liệu được lưu
    const verifyOrder = await this.orderRepository.findOne(id);
    console.log('🔍 Verification from database:', {
      id: verifyOrder?.id,
      status: verifyOrder?.status,
      cancellationReason: verifyOrder?.cancellationReason,
    });

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
    const order = await this.create({
      ...dto,
      status: 'pending', // Đảm bảo status là pending
    });

    this.logger.log('Order created:', order.id, order.orderNumber);

    // BƯỚC 2: Tạo đơn hàng ZaloPay
    const zaloPayResult = await this.zaloPayService.createOrder({
      amount: Number(dto.totalAmount),
      description: `Thanh toán đơn hàng #${order.orderNumber || order.id}`,
      appTransId: dto.appTransId,
    });

    this.logger.log('ZaloPay result:', zaloPayResult);

    // Cập nhật lại đơn hàng với appTransId và các trường từ zaloPayResult
    if (zaloPayResult && zaloPayResult.app_trans_id) {
      await this.orderRepository.update(order.id, {
        appTransId: zaloPayResult.app_trans_id,
        zpTransToken: zaloPayResult.zp_trans_token,
        status: 'pending',
      });
      this.logger.log('Đã cập nhật appTransId cho đơn hàng:', zaloPayResult.app_trans_id);
    }

    // Lưu user_transaction với status phù hợp khi tạo đơn hàng
    if (order && dto.userId) {
      await this.userTransactionService.create({
        userId: dto.userId,
        orderId: order.id,
        amount: String(order.totalAmount),
        method: dto.paymentMethod === 'zalopay' ? TransactionMethod.ZALOPAY : TransactionMethod.CASH,
        status: dto.paymentMethod === 'zalopay' ? TransactionStatus.SUCCESS : TransactionStatus.PENDING,
        transTime: new Date().toISOString(),
        transactionCode: null,
        description: `Tạo giao dịch cho đơn hàng #${order.orderNumber}`,
      });
    }

    return {
      ...order,
      order_number: order.orderNumber,
    };
  }

  async markAsPaid(orderId: string, opts: { method?: string; transactionId?: string }) {
    const order = await this.orderRepository.findOne(orderId);
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    await this.orderRepository.update(orderId, {
      // Không update status nữa, chỉ update zpTransToken
      zpTransToken: opts.transactionId || order.zpTransToken,
    });

    // Gửi email thông báo thanh toán thành công cho ZaloPay
    try {
      const user = await this.userRepository.findOne(order.userId);
      if (user?.email) {
        // Enrich order data với items
        const enrichedOrder = await this.findOne(order.id);
        const customerName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email || 'Quý khách';

        await this.emailService.sendPaymentSuccessEmail(user.email, enrichedOrder, customerName);
        this.logger.log(`Payment success email sent to ${user.email} for ZaloPay order ${order.id}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send payment success email for ZaloPay: ${error.message}`);
      // Không throw error để không ảnh hưởng đến flow chính
    }

    // Có thể lưu thêm transaction vào bảng user_transaction nếu cần
    // await this.userTransactionService.create({ ... })
    return true;
  }

  async checkOrderPaymentStatus(orderId: string) {
    const transactions = await this.userTransactionService.findByOrderId(orderId);
    return transactions.some(tx => tx.status === 'success');
  }
}
