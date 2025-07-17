import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { UserTransactionService } from './user-transaction.service';
import { CreateUserTransactionDto } from './dto/create-user-transaction.dto';

@Controller('user-transaction')
export class UserTransactionController {
  constructor(private readonly userTransactionService: UserTransactionService) {}

  @Post()
  async create(@Body() createUserTransactionDto: CreateUserTransactionDto) {
    return this.userTransactionService.create(createUserTransactionDto);
  }

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.userTransactionService.findAllWithUserOrder(Number(page), Number(limit));
  }
} 