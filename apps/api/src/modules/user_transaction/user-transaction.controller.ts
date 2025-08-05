import { Controller, Get, Query } from '@nestjs/common';

import { UserTransactionService } from './user-transaction.service';

@Controller('user-transaction')
export class UserTransactionController {
  constructor(private readonly userTransactionService: UserTransactionService) {}

  // ❌ Xóa endpoint POST để không cho phép tạo transaction trực tiếp
  // Transaction chỉ nên được tạo thông qua business logic (như ZaloPay callback)
  // @Post()
  // async create(@Body() createUserTransactionDto: CreateUserTransactionDto) {
  //   return this.userTransactionService.create(createUserTransactionDto);
  // }

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.userTransactionService.findAllWithUserOrder(Number(page), Number(limit));
  }

  @Get('all')
  async findAllNoPaging() {
    return this.userTransactionService.findAllWithUserOrder(1, 100000);
  }
}
