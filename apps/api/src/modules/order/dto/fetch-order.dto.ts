import { IsOptional, IsArray, IsString, IsNumber, IsEnum } from 'class-validator';
import { orderStatusEnum } from '~/database/schema/orders';

// Kiểu enum trạng thái đơn hàng
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];

export class FetchOrdersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(orderStatusEnum.enumValues, { each: true })
  status?: OrderStatus[];

  @IsOptional()
  @IsNumber()
  offset?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}


export class FetchOrdersResponseDto {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
}
