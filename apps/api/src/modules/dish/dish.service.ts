import { Injectable, NotFoundException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { DishRepository } from '~/database/repositories/dish.repository';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

@Injectable()
export class DishService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly dishRepository: DishRepository,
  ) {
    this.logger.setContext(DishService.name);
  }

  async findAll() {
    this.logger.info('Fetching all dishes...');
    return this.dishRepository.findAll();
  }

  async findAllForAdmin() {
    this.logger.info('Fetching all dishes for admin...');
    return this.dishRepository.findAllForAdmin();
  }

  async findOne(id: string) {
    this.logger.info(`Finding dish with id: ${id}`);
    const dish = await this.dishRepository.findOne(id);
    if (!dish) throw new NotFoundException('Dish not found');
    return dish;
  }

  async create(data: CreateDishDto) {
    this.logger.info(`Creating dish: ${data.name}`);
    return this.dishRepository.create(data);
  }

  async update(id: string, data: UpdateDishDto) {
    this.logger.info(`Updating dish with id: ${id}`);
    const existing = await this.dishRepository.findOne(id);
    if (!existing) throw new NotFoundException('Dish not found');

    // Xử lý basePrice để tránh overflow
    const updateData = { ...data };
    if (updateData.basePrice) {
      const price = parseFloat(String(updateData.basePrice));
      if (!isNaN(price)) {
        // Đảm bảo giá trị không vượt quá 99,999,999
        const maxValue = 99999999;
        const clampedPrice = Math.min(price, maxValue);
        // Gửi dưới dạng string
        updateData.basePrice = clampedPrice.toString();
      }
    }

    this.logger.info(`Update data: ${JSON.stringify(updateData)}`);
    return this.dishRepository.update(id, updateData);
  }

  async remove(id: string) {
    this.logger.info(`Removing dish with id: ${id}`);
    const existing = await this.dishRepository.findOne(id);
    if (!existing) throw new NotFoundException('Dish not found');
    await this.dishRepository.delete(id);
    return { message: 'Dish deleted successfully' };
  }

  /**
   * Lấy dish theo ngôn ngữ từ Accept-Language header
   */
  async findOneWithLanguageFromHeader(id: string, acceptLanguage?: string) {
    this.logger.info(`Finding dish with id: ${id} and language from header`);
    const dish = await this.dishRepository.findOne(id);
    if (!dish) throw new NotFoundException('Dish not found');
    return dish;
  }
}
