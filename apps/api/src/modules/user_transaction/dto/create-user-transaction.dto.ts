import { IsUUID, IsNumber, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum TransactionMethod {
  CASH = 'cash',
  ZALOPAY = 'zalopay',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export class CreateUserTransactionDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  orderId: string;

  @IsString()
  amount: string;

  @IsEnum(TransactionMethod)
  method: TransactionMethod;

  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @IsDateString()
  transTime: string;

  @IsOptional()
  @IsString()
  transactionCode?: string;

  @IsString()
  description: string;
} 