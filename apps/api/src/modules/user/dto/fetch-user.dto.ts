import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FetchUsersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @Transform(
    ({ value }) => {
      const items = Array.isArray(value) ? value : (value as string).split(',').map(v => v.trim());
      const booleanArray = items.map(v => v === 'true');
      return Array.isArray(booleanArray) ? booleanArray : [booleanArray];
    },
    { toClassOnly: true },
  )
  @IsBoolean({ each: true })
  status?: boolean[];
}

export class FetchUsersResponseDto {
  @ApiProperty({ description: 'ID of the banner', example: 'fd7fbfc6-0b39-48e8-b672-6acdf8778ee4' })
  readonly id: string;

  @ApiProperty({ description: 'First name of the user', example: 'John' })
  readonly firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  readonly lastName: string;

  @ApiProperty({ description: 'Email of the user', example: 'john.doe@example.com' })
  readonly email: string;

  @ApiProperty({ description: 'Phone number of the user', example: '+1234567890' })
  readonly phoneNumber: string;

  @ApiProperty({ description: 'Role of the user', example: 'admin' })
  readonly role: string;

  @ApiProperty({ description: 'Status of the user', example: true })
  readonly isActive: boolean;

  @ApiProperty({ description: 'Last login date of the user', example: '2025-01-01T00:00:00.000Z' })
  readonly lastLogin: Date;

  @ApiProperty({ description: 'Creation date of the user', example: '2025-01-01T00:00:00.000Z' })
  readonly createdAt: Date;

  @ApiProperty({ description: 'Last update date of the user', example: '2025-01-01T00:00:00.000Z' })
  readonly updatedAt: Date;

  @ApiProperty({ description: 'Created by', example: 'fd7fbfc6-0b39-48e8-b672-6acdf8778ee4' })
  readonly createdBy: string;

  @ApiProperty({ description: 'Updated by', example: 'fd7fbfc6-0b39-48e8-b672-6acdf8778ee4' })
  readonly updatedBy: string;
}
