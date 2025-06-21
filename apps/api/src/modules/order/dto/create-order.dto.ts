import { IsOptional, IsUUID, IsNumber, IsEnum, IsObject } from 'class-validator';
import { orderStatusEnumValues } from '../constants/order-status.constant';


export class CreateOrderDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsObject()
  orderItems: any;

  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsEnum(orderStatusEnumValues)
  status?: string;

  @IsOptional()
  @IsUUID()
  createdBy?: string;
}
