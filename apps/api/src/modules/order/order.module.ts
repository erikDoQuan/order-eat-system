import { Module } from '@nestjs/common';


import { OrderRepository } from '~/database/repositories/order.repository';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
  exports: [OrderService],
})
export class OrderModule {}
