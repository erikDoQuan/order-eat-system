import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ZaloPayCallbackDto {
  @ApiProperty({
    description: 'Raw data from ZaloPay callback (JSON string)',
    example: '{"app_id":2554,"app_trans_id":"250726_1753512683688431",...}',
  })
  @IsString()
  @IsOptional()
  data?: string;

  @ApiProperty({
    description: 'MAC signature from ZaloPay',
    example: '1b4158d6cf2e9485685a071338a0a62ab23e6c64cf7300fa35140c11544883be',
  })
  @IsString()
  @IsOptional()
  mac?: string;

  @ApiProperty({
    description: 'Callback type from ZaloPay',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  type?: number;

  // Legacy fields for backward compatibility
  @ApiProperty({
    description: 'App transaction ID from ZaloPay',
    example: '240726_123456789',
  })
  @IsString()
  @IsOptional()
  app_trans_id?: string;

  @ApiProperty({
    description: 'Return code from ZaloPay (1 = success, -1 = failed)',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  return_code?: number;

  @ApiProperty({
    description: 'Amount of the transaction',
    example: 100000,
  })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiProperty({
    description: 'ZaloPay transaction token',
    example: 'zp_trans_token_123',
  })
  @IsString()
  @IsOptional()
  zp_trans_token?: string;

  @ApiProperty({
    description: 'Embedded data from ZaloPay',
    example: '{"userId":"user123","orderId":"order123"}',
  })
  @IsString()
  @IsOptional()
  embed_data?: string;

  @ApiProperty({
    description: 'Return message from ZaloPay',
    example: 'Success',
  })
  @IsString()
  @IsOptional()
  return_message?: string;

  @ApiProperty({
    description: 'Order token from ZaloPay',
    example: 'order_token_123',
  })
  @IsString()
  @IsOptional()
  order_token?: string;
}
