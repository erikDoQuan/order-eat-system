import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

import { orderStatusEnumValues, orderTypeEnumValues } from '../constants/order-status.constant';

// Enum values cho cancellation reasons
export const CANCELLATION_REASON_VALUES = [
  'Khách hàng yêu cầu hủy đơn',
  'Không thể liên hệ khách hàng',
  'Hết món ăn',
  'Địa chỉ giao hàng không hợp lệ',
  'Đơn nghi ngờ gian lận',
  'Khu vực ngoài phạm vi giao hàng',
] as const;

export class UpdateOrderDto {
  @ApiProperty({
    description: 'Cập nhật danh sách món trong đơn hàng',
    example: {
      items: [{ dishId: 'a1b2c3d4', quantity: 3 }],
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
    description: 'Mã giao dịch appTransId (nếu có, dùng cho thanh toán online)',
    example: 'abc123xyz',
    required: false,
  })
  @IsOptional()
  appTransId?: string;

  @ApiProperty({
    description: 'Mã giao dịch ZaloPay zpTransToken (nếu có, dùng cho thanh toán ZaloPay)',
    example: 'zp_token_123456',
    required: false,
  })
  @IsOptional()
  zpTransToken?: string;

  @ApiProperty({
    description: 'Lý do hủy đơn hàng (chỉ cần điền khi status = cancelled)',
    enum: CANCELLATION_REASON_VALUES,
    example: 'Khách hàng yêu cầu hủy đơn',
    required: false,
  })
  @IsOptional()
  @IsEnum(CANCELLATION_REASON_VALUES)
  cancellationReason?: string;
}
