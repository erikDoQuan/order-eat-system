import { Module } from '@nestjs/common';

import { OrderRepository } from '~/database/repositories/order.repository';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { DishModule } from '../dish/dish.module';
import { DishSnapshotRepository } from '~/database/repositories/dish_snapshot.repository';
import { UserRepository } from '~/database/repositories/user.repository';
import { NotificationModule } from '../notification/notification.module';
import { UserTransactionModule } from '../user_transaction/user-transaction.module';

@Module({
  imports: [NotificationModule, DishModule, UserTransactionModule],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository, DishSnapshotRepository, UserRepository],
  exports: [OrderService],
})
export class OrderModule {}