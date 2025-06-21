import { IsOptional, IsUUID, IsNumber, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { orderStatusEnumValues } from '../constants/order-status.constant';

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID của người dùng tạo đơn hàng (nếu có)',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    description: 'Danh sách sản phẩm đặt hàng',
    example: {
      items: [
        { dishId: 'a1b2c3d4', quantity: 2 },
        { dishId: 'e5f6g7h8', quantity: 1 },
      ],
    },
  })
  @IsObject()
  orderItems: any;

  @ApiProperty({
    description: 'Tổng số tiền của đơn hàng',
    example: 289000,
  })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({
    description: 'Trạng thái đơn hàng',
    enum: orderStatusEnumValues,
    example: 'pending',
    required: false,
  })
  @IsOptional()
  @IsEnum(orderStatusEnumValues)
  status?: string;

  @ApiProperty({
    description: 'ID của người tạo đơn hàng',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  createdBy?: string;
}
