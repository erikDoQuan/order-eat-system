import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { PaymentRequestDto, PaymentService } from './payment.service';

@Controller('payment')
@ApiTags('Payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('process')
  @ApiOperation({ summary: 'Process payment based on method and status' })
  async processPayment(@Body() paymentRequest: PaymentRequestDto) {
    return this.paymentService.processPayment(paymentRequest);
  }
}
