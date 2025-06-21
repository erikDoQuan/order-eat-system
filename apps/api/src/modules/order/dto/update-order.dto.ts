import { IsOptional, IsEnum, IsUUID, IsNumber, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { orderStatusEnumValues } from '../constants/order-status.constant';

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
  totalAmount?: number;

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
}
