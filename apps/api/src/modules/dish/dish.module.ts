import { Module } from '@nestjs/common';

import { DishRepository } from '~/database/repositories/dish.repository';
import { DishController } from './dish.controller';
import { DishService } from './dish.service';

@Module({
  controllers: [DishController],
  providers: [DishService, DishRepository],
  exports: [DishService, DishRepository],
})
export class DishModule {}