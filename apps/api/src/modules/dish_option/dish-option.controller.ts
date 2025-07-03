import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { DishOptionService } from './dish-option.service';
import { CreateDishOptionDto } from './dto/create-dish-option.dto';
import { UpdateDishOptionDto } from './dto/update-dish-option.dto';

@ApiTags('Dish Options')
@Controller('dish-options')
export class DishOptionController {
  constructor(private readonly service: DishOptionService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả tùy chọn món ăn' })
  @ApiResponse({ status: 200, description: 'Danh sách tất cả tùy chọn món ăn.' })
  findAll() {
    return this.service.findAll();
  }

  @Get('dish/:dishId')
  @ApiOperation({ summary: 'Lấy tùy chọn theo món ăn' })
  @ApiParam({ name: 'dishId', type: 'string', description: 'ID món ăn (UUID)' })
  @ApiResponse({ status: 200, description: 'Danh sách tùy chọn của một món ăn cụ thể.' })
  findByDish(@Param('dishId') dishId: string) {
    return this.service.findByDishId(dishId);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo mới tùy chọn món ăn' })
  @ApiResponse({ status: 200, description: 'Tùy chọn món ăn đã được tạo thành công.' })
  create(@Body() dto: CreateDishOptionDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật tùy chọn món ăn' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID tùy chọn món ăn (UUID)' })
  @ApiResponse({ status: 200, description: 'Tùy chọn món ăn đã được cập nhật.' })
  update(@Param('id') id: string, @Body() dto: UpdateDishOptionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa tùy chọn món ăn' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID tùy chọn món ăn (UUID)' })
  @ApiResponse({ status: 200, description: 'Đã xóa tùy chọn món ăn.' })
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
