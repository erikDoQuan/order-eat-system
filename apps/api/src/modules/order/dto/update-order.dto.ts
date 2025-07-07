import { IsOptional, IsEnum, IsUUID, IsNumber, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { orderStatusEnumValues, orderTypeEnumValues } from '../constants/order-status.constant';

export class UpdateOrderDto {
  @ApiProperty({
    description: 'Cập nhật danh sách món trong đơn hàng',
    example: {
      items: [
        { dishId: 'a1b2c3d4', quantity: 3 },
      ],
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  orderItems?: any;

  @ApiProperty({
    description: 'Cập nhật tổng số tiền đơn hàng',
    example: 150000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  totalAmount?: string;

  @ApiProperty({
    description: 'Cập nhật trạng thái đơn hàng',
    enum: orderStatusEnumValues,
    example: 'confirmed',
    required: false,
  })
  @IsOptional()
  @IsEnum(orderStatusEnumValues)
  status?: string;

  @ApiProperty({
    description: 'ID người cập nhật',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  updatedBy?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động của đơn hàng',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Cập nhật hình thức nhận hàng',
    enum: orderTypeEnumValues,
    example: 'delivery',
    required: false,
  })
  @IsOptional()
  @IsEnum(orderTypeEnumValues)
  type?: string;

  @ApiProperty({
    description: 'Cập nhật địa chỉ giao hàng (bắt buộc nếu type = delivery)',
    example: '123 Đường ABC, Quận 1, TP.HCM',
    required: false,
  })
  @IsOptional()
  deliveryAddress?: string;
}
