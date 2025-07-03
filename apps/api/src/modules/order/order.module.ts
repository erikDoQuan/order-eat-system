import { Module } from '@nestjs/common';

import { OrderRepository } from '~/database/repositories/order.repository';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { DishModule } from '../dish/dish.module';

@Module({
  imports: [DishModule],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
  exports: [OrderService],
})
export class OrderModule {}
