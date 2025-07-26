import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ZaloPayItemDto {
  @IsOptional()
  @IsString()
  dishId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  base?: string;

  @IsOptional()
  @IsString()
  note?: string;

  // Thêm các trường khác có thể có
  @IsOptional()
  @IsString()
  dishName?: string;

  @IsOptional()
  @IsNumber()
  basePrice?: number;
}

export class CreateZaloPayOrderDto {
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ZaloPayItemDto)
  items?: ZaloPayItemDto[];

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  appTransId?: string;

  // Thêm các trường khác có thể có
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  appUser?: string;

  // Cho phép các trường khác
  [key: string]: any;
}
