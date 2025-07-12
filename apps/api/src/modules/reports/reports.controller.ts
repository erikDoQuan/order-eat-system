import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('revenue')
  @ApiQuery({ name: 'from', type: String, required: true, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'to', type: String, required: true, description: 'End date (YYYY-MM-DD)' })
  async getRevenueReport(
    @Query('from') from: string,
    @Query('to') to: string
  ) {
    return this.reportsService.getRevenueReport(from, to);
  }
} 