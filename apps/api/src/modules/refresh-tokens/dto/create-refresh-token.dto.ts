import { IsDate, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

import { User } from '~/database/schema';

export class CreateRefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsOptional()
  createdByIp?: string;

  @IsString()
  @IsOptional()
  revokedByIp?: string;

  @IsDate()
  @IsOptional()
  revokedAt?: Date;

  @IsString()
  @IsNotEmpty()
  userAgent: string;

  @IsUUID(4)
  @IsOptional()
  userId?: string;

  @IsOptional()
  user?: User;
}
