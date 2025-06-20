import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsUUID } from 'class-validator';

export class BulkDeleteDto {
  @ApiProperty({
    description: 'Array ids',
    example: ['xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'],
  })
  @IsArray()
  @ArrayMaxSize(100)
  @IsUUID('4', { each: true })
  ids: string[];
}
