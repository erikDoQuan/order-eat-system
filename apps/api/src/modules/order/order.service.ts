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
    // Validate type và deliveryAddress
    if (dto.type === 'delivery' && !dto.deliveryAddress) {
      throw new Error('Địa chỉ giao hàng là bắt buộc khi chọn hình thức giao hàng (delivery)');
    }
    // Đảm bảo mỗi item có id
    if (dto.orderItems && dto.orderItems.items) {
      dto.orderItems.items = dto.orderItems.items.map(item => ({
        ...item,
        id: item.id || uuidv4(),
      }));
      // Tính tổng tiền giống frontend
      let total = 0;
      for (const item of dto.orderItems.items) {
        const dish = await this.dishRepository.findOne(item.dishId);
        let price = dish?.basePrice ? parseFloat(dish.basePrice as any) : 0;
        // Tính thêm giá size
        if (item.size) {
          if (item.size === 'medium') price += 90000;
          if (item.size === 'large') price += 190000;
        }
        // Tính thêm giá topping (nếu base là id topping)
        if (item.base && !['dày', 'mỏng'].includes(item.base)) {
          const topping = await this.dishRepository.findOne(item.base);
          if (topping) price += topping.basePrice ? parseFloat(topping.basePrice as any) : 0;
        }
        total += price * (item.quantity || 1);
      }
      dto.totalAmount = total;
      console.log('Tổng tiền lưu vào DB:', dto.totalAmount);
    }
    // Xử lý pickupTime cho đơn pickup
    let pickupTime: string | undefined = dto.pickupTime;
    if (dto.type === 'pickup') {
      if (!pickupTime) {
        // Nếu không truyền pickupTime, mặc định +15 phút từ thời điểm tạo (giờ Việt Nam)
        const now = new Date();
        // Lấy thời gian UTC+7
        const vnOffset = 7 * 60; // phút
        const localNow = new Date(now.getTime() + (vnOffset - now.getTimezoneOffset()) * 60000);
        const pickupDate = new Date(localNow.getTime() + 15 * 60000);
        // Định dạng yyyy-MM-dd HH:mm
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
    const { note, ...rest } = dto;
    return this.orderRepository.create({
      ...rest,
      orderItems: dto.orderItems, // đã có note trong từng item
      note: note, // nếu muốn lưu note tổng
      pickupTime,
    });
  }

  async update(id: string, dto: UpdateOrderDto) {
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
    if (dto.type && ['pickup', 'delivery'].includes(dto.type)) {
      order.type = dto.type as any;
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
