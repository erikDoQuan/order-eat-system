import { Controller, Get, Query, BadRequestException, Post, Body, HttpCode, Req, Res, Logger } from '@nestjs/common';
import { ZaloPayService } from './zalopay.service';
import * as crypto from 'crypto';
import { payments } from '../../database/schema/payments';
import { orders } from '../../database/schema/orders';
import { DrizzleService } from '../../database/drizzle/drizzle.service';
import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';

@Controller('zalopay')
export class ZaloPayController {
  private zaloPayService = new ZaloPayService();
  constructor(private readonly drizzle: DrizzleService) {}
  private logger = new Logger('ZaloPayCallback');

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

  @Post('callback')
  @HttpCode(200) // trả về 200 OK
  handleCallback(@Body() body: any) {
    this.logger.log('📥 Nhận callback từ ZaloPay:');
    this.logger.log(JSON.stringify(body, null, 2));
    // Trả về mã thành công để ZaloPay không gọi lại
    return { return_code: 1, return_message: 'OK' };
  }

  @Post('callback/express')
  @HttpCode(200)
  handleCallbackExpress(@Req() req: Request, @Res() res: Response) {
    const body = req.body;
    console.log('ZaloPay callback (express style):', body);
    // TODO: xác thực và xử lý dữ liệu nếu cần
    res.status(200).send({ return_code: 1, return_message: 'Success' });
  }

  // Endpoint test ngrok
  @Get('test-callback')
  testCallback() {
    return { message: 'Ngrok is working!' };
  }
} 