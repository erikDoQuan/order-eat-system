import { IsOptional, IsUUID, IsNumber, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { orderStatusEnumValues, orderTypeEnumValues } from '../constants/order-status.constant';

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
    description: 'Tổng tiền',
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

  @ApiProperty({
    description: 'Hình thức nhận hàng',
    enum: orderTypeEnumValues,
    example: 'delivery',
    required: false,
  })
  @IsOptional()
  @IsEnum(orderTypeEnumValues)
  type?: string;

  @ApiProperty({
    description: 'Địa chỉ giao hàng (bắt buộc nếu type = delivery)',
    example: { address: '123 Đường ABC, Quận 1, TP.HCM', phone: '0987654321', name: 'Nguyễn Văn A' },
    required: false,
    type: Object,
  })
  @IsOptional()
  @IsObject()
  deliveryAddress?: {
    address: string;
    phone: string;
    name?: string;
  };

  @ApiProperty({
    description: 'Ghi chú đơn hàng',
    example: 'Không lấy hành',
    required: false,
  })
  @IsOptional()
  note?: string;

  @ApiProperty({
    description: 'Thời gian nhận hàng (pickup)',
    example: '2024-06-01 18:30',
    required: false,
  })
  @IsOptional()
  pickupTime?: string;
}
