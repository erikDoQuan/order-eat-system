import { Module } from '@nestjs/common';

import { DishSnapshotRepository } from '~/database/repositories/dish_snapshot.repository';
import { OrderRepository } from '~/database/repositories/order.repository';
import { UserRepository } from '~/database/repositories/user.repository';
import { DishModule } from '../dish/dish.module';
import { NotificationModule } from '../notification/notification.module';
import { UserTransactionModule } from '../user_transaction/user-transaction.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [NotificationModule, DishModule, UserTransactionModule],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository, DishSnapshotRepository, UserRepository],
  exports: [OrderService],
})
export class OrderModule {}
