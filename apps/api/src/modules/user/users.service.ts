import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { IResponsePaging } from '~/common/interfaces/response-format.interface';
import { hashPassword } from '~/common/utils/password.util';
import { toSlug } from '~/common/utils/string.util';
import { UserRepository } from '~/database/repositories/user.repository';
import { User, UserWithoutPassword } from '~/database/schema';
import { AwsS3Service } from '~/modules/aws/aws-s3.service';
import { getFileExtension } from '~/modules/files/utils/file.util';
import { FetchUsersDto, FetchUsersResponseDto } from '~/modules/user/dto/fetch-user.dto';
import { AuthBaseService } from '~/shared-modules/auth-base/auth-base.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly logger: PinoLogger,
    private readonly userRepository: UserRepository,
    private readonly authBaseService: AuthBaseService,
    private readonly awsS3Service: AwsS3Service,
  ) {
    this.logger.setContext(UsersService.name);
  }

  async find(queryParams: FetchUsersDto): Promise<IResponsePaging<FetchUsersResponseDto>> {
    this.logger.info(`Start fetching users with filters: ${JSON.stringify(queryParams)}`);
    const { limit, offset } = queryParams;

    try {
      const { data, totalItems } = await this.userRepository.find(queryParams);
      this.logger.info(`End fetching users with filters: ${JSON.stringify(queryParams)}`);
      return {
        data,
        totalItems,
        paginationDto: {
          limit,
          offset,
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching users: ${error.stack}`);
      throw error;
    }
  }

  async findOne(id: string): Promise<UserWithoutPassword | null> {
    return this.userRepository.findOne(id);
  }

  async findByEmail(email: string): Promise<UserWithoutPassword | null> {
    return this.userRepository.findByEmail(email);
  }

  async findByEmailAndPassword(email: string, password: string): Promise<User | null> {
    return this.authBaseService.findByEmailAndPassword(email, password);
  }

  async create(data: CreateUserDto): Promise<UserWithoutPassword> {
    const email = data.email.toLowerCase();

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await hashPassword(data.password);
    return this.userRepository.create({
      ...data,
      email,
      password: hashedPassword,
    });
  }

  async update(id: string, updateDto: UpdateUserDto): Promise<UserWithoutPassword | null> {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateDto.password) {
      updateDto.password = await hashPassword(updateDto.password);
    }

   if (updateDto.email) {
  updateDto.email = updateDto.email.toLowerCase();

  const existingUser = await this.userRepository.findByEmail(updateDto.email);
  if (existingUser && existingUser.id !== id) {
    throw new BadRequestException('Email already in use');
  }
}


    return this.userRepository.update(id, updateDto);
  }

  async delete(id: string): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.userRepository.delete(id);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return this.authBaseService.validatePassword(user, password);
  }

  async updateAvatar(id: string, file: Express.Multer.File) {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const ext = await getFileExtension(file);
    const uniqueName = toSlug(user.email.split('@')[0].replace('.', '_')) + '-avatar-' + new Date().getTime() + '.' + ext;

    user.avatar = uniqueName;

    const response = await this.userRepository.update(user.id, user);

    await this.awsS3Service.putObject({ key: `avatars/${uniqueName}`, body: file.buffer });

    return {
      avatar: response.avatar,
    };
  }
}
