import { forwardRef, Module } from '@nestjs/common';

import { DishSnapshotRepository } from '../../database/repositories/dish_snapshot.repository';
import { DishRepository } from '../../database/repositories/dish.repository';
import { EmailVerificationRepository } from '../../database/repositories/email-verification.repository';
import { FileRepository } from '../../database/repositories/files.repository';
import { OrderRepository } from '../../database/repositories/order.repository';
import { UserRepository } from '../../database/repositories/user.repository';
import { AuthBaseModule } from '../../shared-modules/auth-base/auth-base.module';
import { VerificationService } from '../auth/verification.service';
import { AwsS3Service } from '../aws/aws-s3.service';
import { DishModule } from '../dish/dish.module';
import { EmailModule } from '../email/email.module';
import { FilesService } from '../files/files.service';
import { NotificationModule } from '../notification/notification.module';
import { OrderModule } from '../order/order.module';
import { OrderService } from '../order/order.service';
import { UserTransactionModule } from '../user_transaction/user-transaction.module';
import { UserTransactionService } from '../user_transaction/user-transaction.service';
import { UsersModule } from '../user/users.module';
import { UsersService } from '../user/users.service';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ZaloPayController } from './zalopay.controller';
import { ZaloPayService } from './zalopay.service';

@Module({
  imports: [UserTransactionModule, forwardRef(() => OrderModule), DishModule, NotificationModule, EmailModule, UsersModule, AuthBaseModule],
  controllers: [ZaloPayController, PaymentController],
  providers: [
    ZaloPayService,
    PaymentService,
    UserTransactionService,
    OrderService,
    UsersService,
    AwsS3Service,
    FilesService,
    VerificationService,
    FileRepository,
    EmailVerificationRepository,
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
