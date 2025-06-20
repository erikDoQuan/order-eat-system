import { Module } from '@nestjs/common';

import { RepositoriesModule } from '~/database/repositories/repositories.module';
import { TestController } from './test.controller';

@Module({
  imports: [RepositoriesModule],
  controllers: [TestController],
  providers: [],
})
export class TestModule {}
