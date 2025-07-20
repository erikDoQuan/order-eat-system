import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteOrderDto {
  @ApiPropertyOptional({ example: 'order_123456' })
  orderId?: string;

  @ApiPropertyOptional({ example: '240531_12345678901234' })
  appTransId?: string;

  @ApiProperty({ example: 'ZP1234567890TOKEN' })
  zpTransToken: string;
}
