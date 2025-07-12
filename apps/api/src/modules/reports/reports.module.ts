import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { RepositoriesModule } from '~/database/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {} 