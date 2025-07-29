import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { Response } from '~/common/decorators/response.decorator';
import { CompleteOrderDto } from './dto/complete-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { FetchOrdersDto } from './dto/fetch-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderService } from './order.service';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('confirm-order')
  @ApiOperation({
    summary: 'Xác nhận thanh toán và tạo đơn ZaloPay',
    description: 'Tạo đơn hàng ZaloPay khi người dùng xác nhận thanh toán.',
  })
  @Response({ message: 'Tạo đơn hàng ZaloPay thành công' })
  async confirmOrder(@Body() dto: CreateOrderDto) {
    return this.orderService.confirmOrder(dto);
  }

  @Post('complete')
  @ApiOperation({
    summary: 'Hoàn tất đơn hàng (chuyển pending thành completed)',
    description: 'Cập nhật đơn hàng pending của user thành completed khi xác nhận đã thanh toán.',
  })
  @Response({ message: 'Cập nhật trạng thái đơn hàng thành công' })
  async completeOrder(@Body() dto: CompleteOrderDto) {
    return this.orderService.completeOrder(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách đơn hàng',
    description: 'Trả về danh sách tất cả các đơn hàng có thể lọc theo trạng thái và tìm kiếm.',
  })
  @Response({ message: 'Lấy danh sách đơn hàng thành công' })
  findAll(@Query() query: FetchOrdersDto) {
    return this.orderService.findAll(query);
  }

  @Get('by-number/:orderNumber')
  @ApiOperation({
    summary: 'Lấy chi tiết đơn hàng theo orderNumber',
    description: 'Trả về thông tin chi tiết của một đơn hàng dựa vào orderNumber (số đơn hàng).',
  })
  @Response({ message: 'Lấy chi tiết đơn hàng theo orderNumber thành công' })
  findOneByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.orderService.findOneByOrderNumber(Number(orderNumber));
  }

  @Get('by-zalopay/:appTransId')
  @ApiOperation({
    summary: 'Lấy chi tiết đơn hàng cho ZaloPay theo appTransId',
    description: 'Trả về thông tin chi tiết của một đơn hàng dựa vào appTransId (dùng cho ZaloPay).',
  })
  @Response({ message: 'Lấy chi tiết đơn hàng theo appTransId cho ZaloPay thành công' })
  async getOrderByZaloPay(@Param('appTransId') appTransId: string) {
    console.log('🔍 API by-zalopay called with appTransId:', appTransId);
    const order = await this.orderService.findOneByAppTransId(appTransId);
    console.log('🔍 Order found:', order ? 'YES' : 'NO');
    if (order) {
      console.log('🔍 Order details:', {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        appTransId: order.appTransId,
      });
      console.log('🔍 Order items:', JSON.stringify(order.orderItems, null, 2));
    }
    return { data: order }; // ✅ Wrap trong data object
  }

  @Get('test/:id')
  @ApiOperation({
    summary: 'Test endpoint để kiểm tra order items',
    description: 'Trả về thông tin chi tiết của order với items được enrich.',
  })
  @Response({ message: 'Test order items thành công' })
  async testOrderItems(@Param('id') id: string) {
    const order = await this.orderService.findOne(id);
    console.log('🔍 Test order items for order:', id);
    console.log('🔍 Order items:', JSON.stringify(order?.orderItems, null, 2));

    // Test enrich items
    if (order?.orderItems && typeof order.orderItems === 'object' && 'items' in order.orderItems) {
      const items = (order.orderItems as any).items;
      if (Array.isArray(items)) {
        const enrichedItems = await this.orderService['enrichOrderItems'](items);
        console.log('🔍 Enriched items:', JSON.stringify(enrichedItems, null, 2));
      }
    }

    return { data: order };
  }

  @Get('status')
  @ApiOperation({ summary: 'Check order status by appTransId' })
  async getOrderStatus(@Query('appTransId') appTransId: string) {
    if (!appTransId) {
      return {
        success: false,
        message: 'Missing appTransId parameter',
      };
    }

    try {
      console.log('🔍 Checking order status for appTransId:', appTransId);

      // Tìm order theo appTransId
      const order = await this.orderService.findOneByAppTransId(appTransId);

      if (!order) {
        return {
          success: false,
          message: 'Order not found',
          status: 'NOT_FOUND',
        };
      }

      // Kiểm tra user_transaction để xác định isPaid
      const hasSuccessfulTransaction = await this.orderService.checkOrderPaymentStatus(order.id);

      console.log('✅ Order found:', {
        id: order.id,
        status: order.status,
        appTransId: order.appTransId,
        hasSuccessfulTransaction,
      });

      return {
        success: true,
        order: {
          id: order.id,
          status: order.status,
          appTransId: order.appTransId,
          returnCode: null, // Tạm thời set null vì field chưa có trong DB
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
        },
        status: order.status,
        isPaid: hasSuccessfulTransaction, // Kiểm tra user_transaction thay vì order.status
      };
    } catch (error) {
      console.error('❌ Error checking order status:', error);
      return {
        success: false,
        message: 'Error checking order status',
        error: String(error),
      };
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết đơn hàng theo ID',
    description: 'Trả về thông tin chi tiết của một đơn hàng dựa vào ID.',
  })
  @Response({ message: 'Lấy chi tiết đơn hàng thành công' })
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Tạo đơn hàng mới',
    description: 'Tạo một đơn hàng mới với thông tin chi tiết như sản phẩm, tổng tiền, trạng thái, người dùng.',
  })
  @Response({ message: 'Tạo đơn hàng thành công' })
  create(@Body() dto: CreateOrderDto) {
    return this.orderService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật đơn hàng theo ID',
    description: 'Cập nhật thông tin đơn hàng bao gồm sản phẩm, trạng thái và tổng tiền.',
  })
  @Response({ message: 'Cập nhật đơn hàng thành công' })
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto, @Req() req: Request) {
    const adminId = (req as any).user?.id;
    return this.orderService.update(id, { ...dto, updatedBy: adminId });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá đơn hàng theo ID', description: 'Xoá một đơn hàng khỏi hệ thống dựa vào ID.' })
  @Response({ message: 'Xoá đơn hàng thành công' })
  async remove(@Param('id') id: string) {
    await this.orderService.deleteHard(id);
    return { statusCode: 200, message: 'Xoá đơn hàng thành công', data: { id } };
  }
}
