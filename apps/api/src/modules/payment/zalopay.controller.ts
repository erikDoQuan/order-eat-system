import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ZaloPayService } from './zalopay.service';

@Controller('zalopay')
export class ZaloPayController {
  private zaloPayService = new ZaloPayService();

  @Get('create-order')
  async createOrder(@Query('amount') amount: string, @Query('orderId') orderId: string) {
    const total = Math.round(Number(amount));
    try {
      const result = await this.zaloPayService.createOrder(total, orderId, `Thanh toán đơn hàng #${orderId}`);
      return result; // Trả về URL QR và thông tin thanh toán
    } catch (err: any) {
      throw new BadRequestException(err.message || 'Tạo đơn hàng ZaloPay thất bại');
    }
  }
} 