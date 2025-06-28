import { PartialType } from '@nestjs/mapped-types';

import { CreateDishOptionDto } from './create-dish-option.dto';

export class UpdateDishOptionDto extends PartialType(CreateDishOptionDto) {}
