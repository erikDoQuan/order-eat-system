import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';

import { Response } from '~/common/decorators/response.decorator';
import { OrderService } from './order.service';

import { FetchOrdersDto } from './dto/fetch-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách đơn hàng',
    description: 'Trả về danh sách tất cả các đơn hàng có thể lọc theo trạng thái và tìm kiếm.',
  })
  @Response({ message: 'Lấy danh sách đơn hàng thành công' })
  findAll(@Query() query: FetchOrdersDto) {
    return this.orderService.findAll(query);
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

  @Get('by-number/:orderNumber')
  @ApiOperation({
    summary: 'Lấy chi tiết đơn hàng theo orderNumber',
    description: 'Trả về thông tin chi tiết của một đơn hàng dựa vào orderNumber (số đơn hàng).',
  })
  @Response({ message: 'Lấy chi tiết đơn hàng theo orderNumber thành công' })
  findOneByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.orderService.findOneByOrderNumber(Number(orderNumber));
  }

  @Get('by-zalopay/:orderNumber')
  @ApiOperation({
    summary: 'Lấy chi tiết đơn hàng cho ZaloPay theo orderNumber',
    description: 'Trả về thông tin chi tiết của một đơn hàng dựa vào orderNumber (dùng cho ZaloPay).',
  })
  @Response({ message: 'Lấy chi tiết đơn hàng theo orderNumber cho ZaloPay thành công' })
  getOrderByZaloPay(@Param('orderNumber') orderNumber: string) {
    return this.orderService.findOneByOrderNumber(Number(orderNumber));
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
