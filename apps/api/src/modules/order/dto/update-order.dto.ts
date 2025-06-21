import { IsOptional, IsEnum, IsUUID, IsNumber, IsObject } from 'class-validator';
import { orderStatusEnumValues } from '../constants/order-status.constant';


export class UpdateOrderDto {
  @IsOptional()
  @IsObject()
  orderItems?: any;

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsEnum(orderStatusEnumValues)
  status?: string;

  @IsOptional()
  @IsUUID()
  updatedBy?: string;
}
