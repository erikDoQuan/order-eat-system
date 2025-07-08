import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';

import { Response } from '~/common/decorators/response.decorator';
import { DishService } from './dish.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

@ApiTags('Dishes')
@Controller('dishes')
export class DishController {
  constructor(private readonly dishService: DishService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo món ăn mới' })
  @Response({ message: 'Tạo món ăn thành công' })
  create(@Body() createDishDto: CreateDishDto) {
    return this.dishService.create(createDishDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả món ăn' })
  @Response({ message: 'Lấy danh sách món ăn thành công' })
  findAll(
    @Req() req?: Request
  ) {
    return this.dishService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin món ăn theo ID' })
  @Response({ message: 'Lấy thông tin món ăn thành công' })
  findOne(
    @Param('id') id: string,
    @Req() req?: Request
  ) {
    return this.dishService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật món ăn theo ID' })
  @Response({ message: 'Cập nhật món ăn thành công' })
  update(@Param('id') id: string, @Body() updateDishDto: UpdateDishDto) {
    return this.dishService.update(id, updateDishDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá món ăn theo ID' })
  @Response({ message: 'Xoá món ăn thành công' })
  remove(@Param('id') id: string) {
    return this.dishService.remove(id);
  }
}