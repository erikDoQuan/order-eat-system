import * as crypto from 'crypto';
import { BadRequestException, Body, Controller, Get, HttpCode, Logger, Post, Query, Req, Res } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { Request, Response } from 'express';

import { DrizzleService } from '../../database/drizzle/drizzle.service';
import { orders } from '../../database/schema/orders';
import { payments } from '../../database/schema/payments';
import { userTransactions } from '../../database/schema/user_transactions';
import { OrderService } from '../order/order.service';
import { TransactionMethod, TransactionStatus } from '../user_transaction/dto/create-user-transaction.dto';
import { UserTransactionService } from '../user_transaction/user-transaction.service';
import { ZaloPayService } from './zalopay.service';

@Controller('zalopay')
export class ZaloPayController {
  private zaloPayService = new ZaloPayService();
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly userTransactionService: UserTransactionService,
    private readonly orderService: OrderService,
  ) {}
  private logger = new Logger('ZaloPayCallback');

  @Get('create-order')
  async createOrder(@Query('amount') amount: string, @Query('orderInfo') orderInfo: string) {
    // orderInfo là JSON string chứa thông tin đơn hàng tạm (orderItems, userId, ...)
    const total = Math.round(Number(amount));
    try {
      // Chỉ tạo QR, không tạo/lưu đơn hàng ở đây!
      const result = await this.zaloPayService.createOrder(total, Date.now().toString(), `Thanh toán đơn hàng`, orderInfo);
      return result; // Trả về URL QR và thông tin thanh toán
    } catch (err: any) {
      throw new BadRequestException(err.message || 'Tạo đơn hàng ZaloPay thất bại');
    }
  }

  @Post('callback')
  @HttpCode(200) // trả về 200 OK
  async handleCallback(@Body() body: any) {
    try {
      this.logger.log('📥 Nhận callback từ ZaloPay:');
      this.logger.log(JSON.stringify(body, null, 2));

      // Nếu body.data là JSON string, parse nó để lấy các trường thực sự
      let data = body;
      if (body.data && typeof body.data === 'string') {
        try {
          data = JSON.parse(body.data);
        } catch (e) {
          this.logger.error('Không parse được body.data:', e);
          return { return_code: 1, return_message: 'Dữ liệu callback không hợp lệ' };
        }
      }
      this.logger.log('ZaloPay callback data (sau parse): ' + JSON.stringify(data));
      // Lấy appTransId từ data hoặc body (ưu tiên data)
      let appTransIdValue = undefined;
      if (data && (data.app_trans_id || data.appTransId)) {
        appTransIdValue = data.app_trans_id || data.appTransId;
      } else if (body && body.app_trans_id) {
        appTransIdValue = body.app_trans_id;
      }
      this.logger.log('appTransId truyền vào orderService.create:', appTransIdValue);

      // Chỉ xử lý khi thanh toán thành công
      if (body.return_code == 1) {
        // Lấy thông tin đơn hàng từ embed_data
        let orderInfo = {};
        if (data.embed_data) {
          try {
            orderInfo = JSON.parse(data.embed_data);
          } catch (e) {
            this.logger.error('Không parse được embed_data:', e);
          }
        }
        // Validate orderInfo (orderItems, userId, ...)
        if (orderInfo && orderInfo['userId'] && orderInfo['orderItems'] && orderInfo['totalAmount']) {
          // Tìm đơn hàng theo appTransId
          let order = null;
          if (appTransIdValue) {
            order = await this.orderService.findOneByAppTransId(appTransIdValue);
          }

          // Nếu không tìm thấy đơn hàng theo appTransId, không tạo đơn hàng mới
          // Chỉ cập nhật đơn hàng đã tồn tại
          if (order) {
            this.logger.log('Tìm thấy đơn hàng, cập nhật trạng thái thành completed:', order.id);

            // Cập nhật trạng thái đơn hàng thành completed
            await this.orderService.update(order.id, {
              status: 'completed',
              updatedBy: order.userId,
            });

            // Cập nhật user_transaction hiện có thành SUCCESS
            const existingTransactions = await this.drizzle.db
              .select()
              .from(userTransactions)
              .where(aliases => and(eq(aliases.orderId, order.id), eq(aliases.method, 'zalopay')));

            if (existingTransactions.length > 0) {
              // Cập nhật transaction đầu tiên thành SUCCESS
              await this.userTransactionService.updateByOrderId(order.id, {
                status: TransactionStatus.SUCCESS,
                transTime: new Date().toISOString(),
                transactionCode: data.zp_trans_token || data.order_token || '',
                description: `Thanh toán ZaloPay thành công cho đơn hàng #${order.orderNumber || order.id}`,
                method: TransactionMethod.ZALOPAY,
              });
              this.logger.log('Cập nhật user_transaction thành SUCCESS cho orderId:', order.id);
            } else {
              // Tạo user_transaction mới nếu chưa có
              await this.userTransactionService.create({
                userId: order.userId,
                orderId: order.id,
                amount: String(order.totalAmount),
                method: TransactionMethod.ZALOPAY,
                status: TransactionStatus.SUCCESS,
                transTime: new Date().toISOString(),
                transactionCode: data.zp_trans_token || data.order_token || '',
                description: `Thanh toán ZaloPay thành công cho đơn hàng #${order.orderNumber || order.id}`,
              });
              this.logger.log('Tạo user_transaction mới với status SUCCESS');
            }
          } else {
            this.logger.log('Không tìm thấy đơn hàng với appTransId:', appTransIdValue);
          }
        } else {
          this.logger.error('orderInfo thiếu thông tin cần thiết');
        }
      }
      // Trả về mã thành công để ZaloPay không gọi lại
      return { return_code: 1, return_message: 'OK' };
    } catch (err: any) {
      this.logger.error('Lỗi callback ZaloPay:', err);
      return { return_code: 1, return_message: 'Lỗi xử lý callback: ' + (err?.message || err) };
    }
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
