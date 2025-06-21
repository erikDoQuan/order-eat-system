import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderRepository } from '~/database/repositories/order.repository';
import { FetchOrdersDto } from './dto/fetch-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';


@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async findAll(dto: FetchOrdersDto) {
    return this.orderRepository.find(dto);
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne(id);
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    return order;
  }

  async create(dto: CreateOrderDto) {
    return this.orderRepository.create(dto);
  }

  async update(id: string, dto: UpdateOrderDto) {
    return this.orderRepository.update(id, dto);
  }

  async delete(id: string) {
    return this.orderRepository.delete(id);
  }
}
