import { Module } from '@nestjs/common';
import { UserTransactionController } from './user-transaction.controller';
import { UserTransactionService } from './user-transaction.service';

@Module({
  controllers: [UserTransactionController],
  providers: [UserTransactionService],
  exports: [UserTransactionService],
})
export class UserTransactionModule {} 