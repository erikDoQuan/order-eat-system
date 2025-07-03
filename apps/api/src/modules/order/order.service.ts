import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderRepository } from '~/database/repositories/order.repository';
import { FetchOrdersDto } from './dto/fetch-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { v4 as uuidv4 } from 'uuid';
import { DishRepository } from '~/database/repositories/dish.repository';


@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly dishRepository: DishRepository,
  ) {}

  async findAll(dto: FetchOrdersDto) {
    const result = await this.orderRepository.find(dto);
    return result;
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne(id);
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    return order;
  }

  async create(dto: CreateOrderDto) {
    // Đảm bảo mỗi item có id
    if (dto.orderItems && dto.orderItems.items) {
      dto.orderItems.items = dto.orderItems.items.map(item => ({
        ...item,
        id: item.id || uuidv4(),
      }));
      // Tính tổng tiền
      let total = 0;
      for (const item of dto.orderItems.items) {
        const dish = await this.dishRepository.findOne(item.dishId);
        const price = dish?.basePrice ? parseFloat(dish.basePrice as any) : 0;
        total += price * (item.quantity || 1);
      }
      dto.totalAmount = total.toString();
    }
    return this.orderRepository.create(dto);
  }

  async update(id: string, dto: UpdateOrderDto) {
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
        const idx = currentItems.findIndex((i: any) =>
          i.dishId === newItem.dishId &&
          i.size === newItem.size &&
          i.base === newItem.base &&
          i.note === newItem.note
        );
        if (idx > -1) {
          // Cập nhật quantity tuyệt đối
          currentItems[idx].quantity = newItem.quantity;
          currentItems[idx].id = newItem.id; // Đảm bảo id đồng bộ
        } else {
          currentItems.push({ ...newItem });
        }
      }
      // Loại bỏ item có quantity <= 0
      order.orderItems = { items: currentItems.filter((i: any) => i.quantity > 0) };
      // Tính lại tổng tiền
      let total = 0;
      for (const item of (order.orderItems as { items: any[] }).items) {
        const dish = await this.dishRepository.findOne(item.dishId);
        const price = dish?.basePrice ? parseFloat(dish.basePrice as any) : 0;
        total += price * (item.quantity || 1);
      }
      order.totalAmount = total.toString();
    }

    // Cập nhật các trường khác nếu có
    if (dto.status && ['pending','confirmed','preparing','delivering','completed','cancelled'].includes(dto.status)) {
      order.status = dto.status as any;
    }
    if (dto.isActive !== undefined) order.isActive = dto.isActive;

    // Lưu lại order
    return this.orderRepository.update(id, order);
  }

  async delete(id: string, currentUserId: string) {
    // Có thể kiểm tra quyền user ở đây nếu cần
    return this.orderRepository.hardDelete(id);
  }

  async deleteHard(id: string) {
    return this.orderRepository.hardDelete(id);
  }
}
