import * as crypto from 'crypto';
import { BadRequestException, Body, Controller, Get, HttpCode, Logger, Post, Query, Req, Res } from '@nestjs/common';
import { eq } from 'drizzle-orm';
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
          // Lấy danh sách order gần nhất của userId
          const recentOrders = await this.drizzle.db.query.orders.findMany({
            where: (row, { eq }) => eq(row.userId, orderInfo['userId']),
            orderBy: row => row.createdAt,
            limit: 10,
          });
          const THIRTY_MINUTES = 30 * 60 * 1000;
          const now = Date.now();
          const existedOrder = recentOrders.find(
            row =>
              String(row.totalAmount) === String(orderInfo['totalAmount']) &&
              row.type === orderInfo['type'] &&
              JSON.stringify(row.deliveryAddress) === JSON.stringify(orderInfo['deliveryAddress']) &&
              now - new Date(row.createdAt).getTime() < THIRTY_MINUTES,
          );
          let order = existedOrder;
          if (!order) {
            // Tạo order nếu chưa có
            order = await this.orderService.create({
              userId: orderInfo['userId'],
              orderItems: orderInfo['orderItems'],
              totalAmount: orderInfo['totalAmount'],
              type: orderInfo['type'],
              deliveryAddress: orderInfo['deliveryAddress'],
              note: orderInfo['note'] || '',
              paymentMethod: 'zalopay',
            });
          }
          // Tạo user_transaction với status SUCCESS nếu chưa có
          const existedTxArr = await this.drizzle.db
            .select()
            .from(userTransactions)
            .where((row, { eq, and }) => and(eq(row.orderId, order.id), eq(row.method, 'zalopay'), eq(row.status, 'success')));
          const existedTx = existedTxArr[0];
          if (!existedTx) {
            await this.userTransactionService.create({
              userId: order.userId,
              orderId: order.id,
              amount: String(order.totalAmount),
              method: TransactionMethod.ZALOPAY,
              status: TransactionStatus.SUCCESS,
              transTime: new Date().toISOString(),
              transactionCode: data.zp_trans_token || data.order_token || '',
              description: data.description || `Thanh toán đơn hàng #${order.orderNumber || order.id}`,
            });
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
