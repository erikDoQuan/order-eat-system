import { Module } from '@nestjs/common';

import { OrderRepository } from '~/database/repositories/order.repository';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { DishModule } from '../dish/dish.module';
import { DishSnapshotRepository } from '~/database/repositories/dish_snapshot.repository';

@Module({
  imports: [DishModule],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository, DishSnapshotRepository],
  exports: [OrderService],
})
export class OrderModule {}
