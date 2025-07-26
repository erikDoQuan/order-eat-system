import { Body, Controller, Get, HttpCode, Post, Query, Req, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateZaloPayOrderDto } from './dto/create-zalopay-order.dto';
import { ZaloPayCallbackDto } from './dto/zalopay-callback.dto';
import { ZaloPayService } from './zalopay.service';

@Controller('zalopay')
@ApiTags('ZaloPay')
export class ZaloPayController {
  constructor(private readonly zaloPayService: ZaloPayService) {}

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
  async handleCallback(@Body() body: ZaloPayCallbackDto, @Req() req: any) {
    console.log('🚨 CALLBACK RECEIVED - TIMESTAMP:', new Date().toISOString());
    const userAgent = req.headers['user-agent'] || '';
    const isRealZaloPay = !userAgent.includes('PowerShell') && !userAgent.includes('Invoke-WebRequest');

    console.log('🔔 ZaloPay callback received!');
    console.log('📧 Request method:', req.method);
    console.log('📧 Request URL:', req.url);
    console.log('📱 User-Agent:', userAgent);
    console.log('🎯 Is Real ZaloPay:', isRealZaloPay ? '✅ YES' : '❌ NO (Test)');
    console.log('📧 Request headers:', JSON.stringify(req.headers, null, 2));
    console.log('📧 Request body:', JSON.stringify(body, null, 2));
    console.log('🔍 Data field:', body?.data);
    console.log('🔍 MAC:', body?.mac);
    console.log('🔍 Type:', body?.type);

    // Parse data field if exists (ZaloPay sends data as JSON string)
    let parsedData: Record<string, any> = {};
    if (body?.data) {
      try {
        parsedData = JSON.parse(body.data);
        console.log('✅ Parsed data successfully:', parsedData);
        console.log('🔍 App Trans ID from parsed data:', parsedData.app_trans_id);
        console.log('🔍 Return Code from parsed data:', parsedData.return_code);
        console.log('🔍 Amount from parsed data:', parsedData.amount);
        console.log('🔍 Embed Data from parsed data:', parsedData.embed_data);
      } catch (err) {
        console.error('❌ Error parsing data field:', err);
        parsedData = {};
      }
    }

    // Use parsed data if available, otherwise use legacy fields
    const callbackData = {
      ...body,
      ...parsedData,
      app_trans_id: parsedData.app_trans_id || body.app_trans_id,
      return_code: parsedData.return_code || body.return_code,
      amount: parsedData.amount || body.amount,
      embed_data: parsedData.embed_data || body.embed_data,
      zp_trans_token: parsedData.zp_trans_token || body.zp_trans_token,
    };

    console.log('🔍 Final callback data:', callbackData);

    // Validation cho real ZaloPay callbacks
    if (isRealZaloPay && (!callbackData || !callbackData.app_trans_id)) {
      console.error('❌ Real ZaloPay callback missing required data');
      return {
        return_code: 1,
        return_message: 'Callback received (missing data)',
      };
    }

    try {
      await this.zaloPayService.handleCallback(callbackData);
      console.log('✅ Đã nhận callback từ ZaloPay:', callbackData);
      return {
        return_code: 1,
        return_message: 'Callback received successfully',
      };
    } catch (err) {
      console.error('Lỗi callback ZaloPay:', err);
      // Vẫn trả về 200 và return_code 1 để ZaloPay không retry
      return {
        return_code: 1,
        return_message: 'Callback received (with error)',
        errorMessage: String(err),
      };
    }
  }

  // Route GET để handle redirect từ ZaloPay sau khi thanh toán thành công
  @Get('callback')
  async handleRedirect(@Query('appTransId') appTransId: string, @Query('return_code') returnCode: string) {
    console.log('🔄 ZaloPay redirect received!');
    console.log('🔍 App Trans ID:', appTransId);
    console.log('🔍 Return Code:', returnCode);

    // Redirect về frontend với thông tin thanh toán
    return {
      message: 'Redirect from ZaloPay',
      appTransId: appTransId,
      returnCode: returnCode,
      redirectUrl: `https://fda84102a052.ngrok-free.app/order-success?appTransId=${appTransId}&return_code=${returnCode}`,
    };
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
}
