import { Injectable, NotFoundException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepository } from '~/database/repositories/category.repository';

@Injectable()
export class CategoryService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly categoryRepository: CategoryRepository,
  ) {
    this.logger.setContext(CategoryService.name);
  }

  async create(data: CreateCategoryDto) {
    this.logger.info(`Creating category: ${data.name}`);
    return this.categoryRepository.create(data);
  }

  async findAll() {
    this.logger.info('Fetching all categories...');
    return this.categoryRepository.findAll();
  }

  async findOne(id: string) {
    this.logger.info(`Finding category with id: ${id}`);
    const category = await this.categoryRepository.findOne(id);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, data: UpdateCategoryDto) {
    this.logger.info(`Updating category with id: ${id}`);
    const existing = await this.categoryRepository.findOne(id);
    if (!existing) throw new NotFoundException('Category not found');
    return this.categoryRepository.update(id, data);
  }

  async remove(id: string) {
    this.logger.info(`Removing category with id: ${id}`);
    const existing = await this.categoryRepository.findOne(id);
    if (!existing) throw new NotFoundException('Category not found');
    await this.categoryRepository.delete(id);
    return { message: 'Category deleted successfully' };
  }
}
