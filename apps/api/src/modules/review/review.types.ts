// src/modules/review/review.types.ts
import { CreateReviewDto } from './dto/create-review.dto';

export type CreateReviewInput = CreateReviewDto & { userId: string };
