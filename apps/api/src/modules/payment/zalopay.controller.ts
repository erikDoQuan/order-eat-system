import { Body, Controller, Get, HttpCode, Post, Query, Req, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { OrderService } from '../order/order.service';
import { TransactionMethod, TransactionStatus } from '../user_transaction/dto/create-user-transaction.dto';
import { UserTransactionService } from '../user_transaction/user-transaction.service';
import { CreateZaloPayOrderDto } from './dto/create-zalopay-order.dto';
import { ZaloPayCallbackDto } from './dto/zalopay-callback.dto';
import { ZaloPayService } from './zalopay.service';

@Controller('zalopay')
@ApiTags('ZaloPay')
export class ZaloPayController {
  constructor(
    private readonly zaloPayService: ZaloPayService,
    private readonly orderService: OrderService,
    private readonly userTransactionService: UserTransactionService,
  ) {}

  @Post('create-order')
  @ApiOperation({ summary: 'Create ZaloPay order' })
  @UsePipes(
    new ValidationPipe({
      skipMissingProperties: true,
      skipNullProperties: true,
      skipUndefinedProperties: true,
      whitelist: false,
      forbidNonWhitelisted: false,
    }),
  )
  async createOrder(@Body() body: any) {
    console.log('🧠 Đã vào controller create-order');
    console.log('📦 Body received:', JSON.stringify(body, null, 2));

    if (!body) {
      console.error('❌ Body is undefined or null');
      return {
        return_code: -1,
        return_message: 'Request body is missing',
        errorMessage: 'Body is undefined or null',
      };
    }

    try {
      const result = await this.zaloPayService.createOrder(body);
      console.log('✅ Đã tạo đơn hàng ZaloPay:', result);
      // Đảm bảo trả về object có thể serialize được
      return {
        return_code: result.return_code || result.returncode || -1,
        return_message: result.return_message || result.returnmessage || 'Unknown',
        qrcode: result.qrcode,
        order_url: result.order_url,
        zp_trans_token: result.zp_trans_token,
        app_trans_id: result.app_trans_id,
      };
    } catch (error) {
      console.error('Lỗi trong createOrder controller:', error);
      return {
        return_code: -1,
        return_message: 'Không thể tạo đơn hàng ZaloPay',
        errorMessage: String(error),
      };
    }
  }

  @Post('callback')
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle ZaloPay callback' })
  async handleZaloCallback(@Body() body: any) {
    console.log('🔄 ZALOPAY CALLBACK RECEIVED!');
    console.log('📦 Raw callback body:', JSON.stringify(body, null, 2));

    try {
      const data = typeof body.data === 'string' ? JSON.parse(body.data) : body.data;
      const appTransId = data.app_trans_id;
      console.log('🔍 Callback received with appTransId:', appTransId);
      console.log('🔍 Full callback data:', JSON.stringify(data, null, 2));

      if (!appTransId) throw new Error('appTransId missing in callback data');

      // Tìm đơn hàng theo appTransId
      const order = await this.orderService.findOneByAppTransId(appTransId);
      if (!order) {
        console.log('❌ Order not found with appTransId:', appTransId);
        // Log tất cả appTransId có trong DB để debug
        const allOrders = await this.orderService.findAll({ limit: 100, offset: 0 });
        console.log('📋 All appTransIds in DB:', allOrders.data.map(o => o.appTransId).filter(Boolean));
        throw new Error('Order not found with appTransId: ' + appTransId);
      }

      console.log('✅ Found order:', order.id, 'with appTransId:', appTransId);

      // Không cập nhật order status, giữ nguyên pending để admin xử lý
      console.log('ℹ️ Giữ nguyên order status pending để admin xử lý');

      // ✅ Thêm user_transaction
      await this.userTransactionService.create({
        userId: order.userId,
        orderId: order.id,
        amount: String(data.amount),
        method: TransactionMethod.ZALOPAY,
        status: TransactionStatus.SUCCESS,
        transTime: new Date().toISOString(),
        transactionCode: data.zp_trans_id || data.zp_trans_token || '',
        description: `Thanh toán ZaloPay cho đơn hàng #${order.orderNumber || order.id}`,
      });

      console.log('✅ User transaction created successfully');

      return {
        return_code: 1,
        return_message: 'Callback received successfully',
      };
    } catch (err) {
      console.error('❌ Lỗi callback ZaloPay:', err);
      return {
        return_code: 1,
        return_message: 'Callback received (with error)',
        errorMessage: String(err),
      };
    }
  }

  // ✅ Route GET để handle redirect từ ZaloPay sau khi thanh toán thành công
  @Get('redirect-after-zalopay')
  @ApiOperation({ summary: 'Handle redirect from ZaloPay after payment' })
  async redirectAfterZaloPay(
    @Query('appTransId') appTransId: string,
    @Query('return_code') returnCode: string,
    @Query('orderId') orderId: string,
    @Res() res: Response,
  ) {
    console.log('🔄 ZaloPay redirect received!');
    console.log('🔍 App Trans ID:', appTransId);
    console.log('🔍 Return Code:', returnCode);
    console.log('🔍 Order ID:', orderId);

    try {
      // Tìm order trong database để lấy thông tin chi tiết
      let order = null;
      if (appTransId) {
        order = await this.zaloPayService.findOrderByAppTransId(appTransId);
      } else if (orderId) {
        order = await this.zaloPayService.findOrderById(orderId);
      }

      // Xác định return_code từ order hoặc query parameter
      const finalReturnCode = order?.returnCode || returnCode || '1';
      const finalAppTransId = order?.appTransId || appTransId || '';

      // Sử dụng cấu hình từ environment
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const redirectUrl = `${frontendUrl}/order-success?appTransId=${finalAppTransId}&return_code=${finalReturnCode}`;

      console.log('🔗 Redirecting to:', redirectUrl);

      // Redirect về frontend
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('❌ Error in redirect handler:', error);
      // Fallback redirect nếu có lỗi
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const fallbackUrl = `${frontendUrl}/order-success?appTransId=${appTransId || ''}&return_code=${returnCode || '1'}`;
      return res.redirect(fallbackUrl);
    }
  }

  // Route GET để handle redirect từ ZaloPay sau khi thanh toán thành công (legacy)
  @Get('callback')
  async handleRedirect(@Query('appTransId') appTransId: string, @Query('return_code') returnCode: string, @Res() res: Response) {
    console.log('🔄 ZaloPay redirect received via GET callback!');
    console.log('🔍 App Trans ID:', appTransId);
    console.log('🔍 Return Code:', returnCode);

    try {
      // Tìm order trong database để lấy thông tin chi tiết
      let order = null;
      if (appTransId) {
        order = await this.zaloPayService.findOrderByAppTransId(appTransId);
      }

      // Xác định return_code từ order hoặc query parameter
      const finalReturnCode = order?.returnCode || returnCode || '1';
      const finalAppTransId = order?.appTransId || appTransId || '';

      // Sử dụng cấu hình từ environment
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const redirectUrl = `${frontendUrl}/order-success?appTransId=${finalAppTransId}&return_code=${finalReturnCode}`;

      console.log('🔗 Redirecting to:', redirectUrl);

      // Redirect về frontend
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('❌ Error in GET callback handler:', error);
      // Fallback redirect nếu có lỗi
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const fallbackUrl = `${frontendUrl}/order-success?appTransId=${appTransId || ''}&return_code=${returnCode || '1'}`;
      return res.redirect(fallbackUrl);
    }
  }

  @Get('check-status')
  @HttpCode(200)
  async checkStatus(@Query('appTransId') appTransId: string) {
    if (!appTransId) {
      throw new Error('Missing appTransId');
    }
    try {
      const result = await this.zaloPayService.checkOrderStatus(appTransId);
      // Đảm bảo trả về object có thể serialize được
      return {
        returncode: result.returncode || -1,
        returnmessage: result.returnmessage || 'Unknown status',
        ...(result.returncode === 1 && { amount: result.amount }),
        ...(result.errorMessage && { errorMessage: result.errorMessage }),
      };
    } catch (error) {
      console.error('Lỗi trong checkStatus controller:', error);
      return {
        returncode: -1,
        returnmessage: 'Lỗi kiểm tra trạng thái',
        errorMessage: String(error),
      };
    }
  }

  // Route test để kiểm tra callback có hoạt động không
  @Get('test-callback')
  @HttpCode(200)
  async testCallback() {
    console.log('🧪 Test callback route được gọi');
    return {
      message: 'Callback route hoạt động bình thường',
      timestamp: new Date().toISOString(),
    };
  }

  // Route test để simulate ZaloPay callback
  @Post('test-callback-simulate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Test simulate ZaloPay callback' })
  async testCallbackSimulate(@Body() body: any) {
    console.log('🧪 TEST: Simulating ZaloPay callback');
    console.log('📦 Test body:', JSON.stringify(body, null, 2));

    try {
      const appTransId = body.appTransId;
      if (!appTransId) {
        return {
          success: false,
          message: 'Missing appTransId in test body',
        };
      }

      // Tìm order
      const order = await this.orderService.findOneByAppTransId(appTransId);
      if (!order) {
        return {
          success: false,
          message: 'Order not found',
          appTransId,
        };
      }

      // Không cập nhật order status, giữ nguyên pending để admin xử lý
      console.log('ℹ️ Giữ nguyên order status pending để admin xử lý');

      // Tạo user transaction
      await this.userTransactionService.create({
        userId: order.userId,
        orderId: order.id,
        amount: String(order.totalAmount),
        method: TransactionMethod.ZALOPAY,
        status: TransactionStatus.SUCCESS,
        transTime: new Date().toISOString(),
        transactionCode: 'TEST_' + Date.now(),
        description: `Test thanh toán ZaloPay cho đơn hàng #${order.orderNumber || order.id}`,
      });

      return {
        success: true,
        message: 'Test callback completed successfully - Order remains pending',
        orderId: order.id,
        appTransId,
        status: 'pending',
      };
    } catch (error) {
      console.error('❌ Test callback error:', error);
      return {
        success: false,
        message: 'Test callback failed',
        error: String(error),
      };
    }
  }

  // Route test để simulate ZaloPay callback với appTransId cụ thể
  @Post('test-callback-specific')
  @HttpCode(200)
  @ApiOperation({ summary: 'Test simulate ZaloPay callback with specific appTransId' })
  async testCallbackSpecific(@Body() body: any) {
    console.log('🧪 TEST: Simulating ZaloPay callback with specific appTransId');
    console.log('📦 Test body:', JSON.stringify(body, null, 2));

    try {
      const appTransId = body.appTransId;
      if (!appTransId) {
        return {
          success: false,
          message: 'Missing appTransId in test body',
        };
      }

      // Tìm order
      const order = await this.orderService.findOneByAppTransId(appTransId);
      if (!order) {
        return {
          success: false,
          message: 'Order not found',
          appTransId,
        };
      }

      // Simulate ZaloPay callback data
      const callbackData = {
        app_trans_id: appTransId,
        return_code: 1,
        amount: order.totalAmount,
        zp_trans_token: 'TEST_' + Date.now(),
        embed_data: JSON.stringify({
          userId: order.userId,
          items: order.orderItems,
          orderId: order.id,
          totalAmount: order.totalAmount,
        }),
      };

      console.log('🔄 Simulating callback with data:', callbackData);

      // Gọi handleCallback
      await this.zaloPayService.handleCallback(callbackData);

      // Kiểm tra lại order status
      const updatedOrder = await this.orderService.findOne(order.id);

      return {
        success: true,
        message: 'Test callback completed successfully',
        orderId: order.id,
        appTransId,
        oldStatus: order.status,
        newStatus: updatedOrder.status,
      };
    } catch (error) {
      console.error('❌ Test callback error:', error);
      return {
        success: false,
        message: 'Test callback failed',
        error: String(error),
      };
    }
  }

  // Route test nhanh để test callback với appTransId cụ thể
  @Post('test-callback-quick')
  @HttpCode(200)
  @ApiOperation({ summary: 'Quick test ZaloPay callback' })
  async testCallbackQuick(@Body() body: any) {
    console.log('🧪 QUICK TEST: Simulating ZaloPay callback');
    console.log('📦 Test body:', JSON.stringify(body, null, 2));

    try {
      const appTransId = body.appTransId || 'ZP743CBETKN5';

      // Tìm order
      const order = await this.orderService.findOneByAppTransId(appTransId);
      if (!order) {
        return {
          success: false,
          message: 'Order not found',
          appTransId,
        };
      }

      // Simulate ZaloPay callback data
      const callbackData = {
        app_trans_id: appTransId,
        return_code: 1,
        amount: order.totalAmount,
        zp_trans_token: 'TEST_' + Date.now(),
        embed_data: JSON.stringify({
          userId: order.userId,
          items: order.orderItems,
          orderId: order.id,
          totalAmount: order.totalAmount,
        }),
      };

      console.log('🔄 Simulating callback with data:', callbackData);

      // Gọi handleCallback
      await this.zaloPayService.handleCallback(callbackData);

      // Kiểm tra lại order status
      const updatedOrder = await this.orderService.findOne(order.id);

      return {
        success: true,
        message: 'Quick test completed - Order status remains pending for admin processing',
        orderId: order.id,
        appTransId,
        oldStatus: order.status,
        newStatus: updatedOrder.status,
        expectedStatus: 'pending',
        note: 'Order remains pending, only user transaction created',
      };
    } catch (error) {
      console.error('❌ Quick test error:', error);
      return {
        success: false,
        message: 'Quick test failed',
        error: String(error),
      };
    }
  }
}
