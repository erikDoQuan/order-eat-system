import { Module } from '@nestjs/common';
import { ZaloPayController } from './zalopay.controller';
import { ZaloPayService } from './zalopay.service';

@Module({
  controllers: [ZaloPayController],
  providers: [ZaloPayService],
})
export class PaymentModule {} 