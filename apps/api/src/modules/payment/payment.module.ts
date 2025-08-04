import { forwardRef, Module } from '@nestjs/common';

import { DishSnapshotRepository } from '../../database/repositories/dish_snapshot.repository';
import { DishRepository } from '../../database/repositories/dish.repository';
import { OrderRepository } from '../../database/repositories/order.repository';
import { UserRepository } from '../../database/repositories/user.repository';
import { DishModule } from '../dish/dish.module';
import { EmailModule } from '../email/email.module';
import { NotificationModule } from '../notification/notification.module';
import { OrderModule } from '../order/order.module';
import { OrderService } from '../order/order.service';
import { UserTransactionModule } from '../user_transaction/user-transaction.module';
import { UserTransactionService } from '../user_transaction/user-transaction.service';
import { ZaloPayController } from './zalopay.controller';
import { ZaloPayService } from './zalopay.service';

@Module({
  imports: [UserTransactionModule, forwardRef(() => OrderModule), DishModule, NotificationModule, EmailModule],
  controllers: [ZaloPayController],
  providers: [
    ZaloPayService,
    UserTransactionService,
    OrderService,
    OrderRepository,
    DishRepository,
    DishSnapshotRepository,
    UserRepository,
    {
      provide: 'ZALOPAY_SERVICE',
      useExisting: ZaloPayService,
    },
  ],
  exports: [ZaloPayService, 'ZALOPAY_SERVICE'],
})
export class PaymentModule {}
