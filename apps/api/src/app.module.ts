import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';

import { AppConfigsModule } from '~/config/config.module';
import { AwsModule } from '~/modules/aws/aws.module';
import { FilesModule } from '~/modules/files/files.module';
import { DrizzleModule } from './database/drizzle/drizzle.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/category/category.module';
import { DishModule } from './modules/dish/dish.module';
import { HealthModule } from './modules/health/health.module';
import { OrderModule } from './modules/order/order.module';
import { ReviewModule } from './modules/review/review.module';
import { TestModule } from './modules/test/test.module';
import { UsersModule } from './modules/user/users.module';
import { LoggerModule } from './shared-modules/logger/logger.module';
import { MiddlewareModule } from './shared-modules/middleware/middleware.module';
import { DishOptionModule } from './modules/dish_option/dish-option.module';
import { ReportsModule } from './modules/reports/reports.module';
import { PaymentModule } from './modules/payment/payment.module';
import { UserTransactionModule } from './modules/user_transaction/user-transaction.module';

@Module({
  imports: [
    AppConfigsModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: () => crypto.randomUUID(),
      },
    }),
    LoggerModule,
    MiddlewareModule,
    HealthModule,
    DrizzleModule,
    TestModule,
    AwsModule,
    FilesModule,
    AuthModule,
    UsersModule,
    DishModule,
    CategoryModule,
    OrderModule,
    ReviewModule,
    DishOptionModule,
    ReportsModule,
    PaymentModule,
    UserTransactionModule,
  ],
  controllers: [],
  exports: [],
})
export class AppModule {}
