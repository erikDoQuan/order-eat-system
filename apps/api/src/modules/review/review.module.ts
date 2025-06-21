import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { AccessTokenGuard } from '~/common/guards/access-token.guard';
import { ReviewRepository } from '~/database/repositories/review.repository';
@Module({
    imports: [JwtModule.register({})],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository],
})
export class ReviewModule {}
