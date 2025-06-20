import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { FileRepository } from '~/database/repositories/files.repository';
import { RepositoriesModule } from '~/database/repositories/repositories.module';
import { AwsS3Service } from '~/modules/aws/aws-s3.service';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [FilesController],
  providers: [FilesService, FileRepository, AwsS3Service, JwtService],
  exports: [FilesService],
})
export class FilesModule {}
