import { Module } from '@nestjs/common';
import { ZaloPayController } from './zalopay.controller';
import { ZaloPayService } from './zalopay.service';
import { UserTransactionModule } from '../user_transaction/user-transaction.module';
import { UserTransactionService } from '../user_transaction/user-transaction.service';
import { OrderModule } from '../order/order.module';
import { OrderService } from '../order/order.service';
import { OrderRepository } from '../../database/repositories/order.repository';
import { DishSnapshotRepository } from '../../database/repositories/dish_snapshot.repository';
import { UserRepository } from '../../database/repositories/user.repository';
import { DishModule } from '../dish/dish.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [UserTransactionModule, OrderModule, DishModule, NotificationModule],
  controllers: [ZaloPayController],
  providers: [ZaloPayService, UserTransactionService, OrderService, OrderRepository, DishSnapshotRepository, UserRepository],
})
export class PaymentModule {} 