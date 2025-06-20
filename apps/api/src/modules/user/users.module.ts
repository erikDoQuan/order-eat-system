import { Module } from '@nestjs/common';

import { RepositoriesModule } from '~/database/repositories/repositories.module';
import { AwsS3Service } from '~/modules/aws/aws-s3.service';
import { FilesService } from '~/modules/files/files.service';
import { AuthBaseModule } from '~/shared-modules/auth-base/auth-base.module';
import { AdminUsersController } from './admin-users.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [RepositoriesModule, AuthBaseModule],
  controllers: [AdminUsersController, UsersController],
  providers: [UsersService, AwsS3Service, FilesService],
  exports: [UsersService],
})
export class UsersModule {}
