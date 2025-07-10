import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { ApiDocumentResponse } from '~/common/decorators/api-document-response.decorator';
import { PaginatedResponse } from '~/common/decorators/paginated-response.decorator';
import { UUIDParam } from '~/common/decorators/param.decorator';
import { Response } from '~/common/decorators/response.decorator';
import { UserWithoutPassword } from '~/database/schema';
import { FetchUsersDto, FetchUsersResponseDto } from '~/modules/user/dto/fetch-user.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller({ path: 'admin/users' })
@ApiTags('Admin Users')
 @UseGuards(AccessTokenGuard)
 @ApiBearerAuth('accessToken')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get users' })
  @PaginatedResponse({ message: 'Get users successfully' })
  findAll(@Query() fetchUsersDto: FetchUsersDto) {
    return this.usersService.find(fetchUsersDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @Response({ message: 'Get user by ID successfully' })
  @ApiParam({ name: 'id', example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' })
  async findOne(@UUIDParam('id') id: string): Promise<UserWithoutPassword> {
    return this.usersService.findOne(id);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get a user by email' })
  @Response({ message: 'Get a user by email successfully' })
  async findByEmail(@Param('email') email: string): Promise<UserWithoutPassword> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @Response({ message: 'Create a new user successfully' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @Response({ message: 'Update user successfully' })
  @ApiParam({ name: 'id', example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' })
  async update(@UUIDParam('id') id: string, @Body() updateDto: UpdateUserDto): Promise<UserWithoutPassword> {
    return this.usersService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @Response({ message: 'Delete a user by ID successfully' })
  @ApiParam({ name: 'id', example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' })
  async delete(@UUIDParam('id') id: string): Promise<UserWithoutPassword> {
    return this.usersService.delete(id);
  }
}
