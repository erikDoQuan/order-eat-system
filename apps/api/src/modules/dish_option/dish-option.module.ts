import { Module } from '@nestjs/common';

// import { DishOptionController } from './dish-option.controller';
import { DishOptionService } from './dish-option.service';
import { DishOptionController } from './dish-option.controller';

@Module({
  controllers: [DishOptionController],
  providers: [DishOptionService],
})
export class DishOptionModule {}
