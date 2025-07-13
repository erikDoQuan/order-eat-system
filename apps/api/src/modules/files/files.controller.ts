import { Controller, Delete, Get, HttpStatus, ParseFilePipeBuilder, Post, Query, UploadedFiles, UseGuards, UseInterceptors, Res, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { ApiDocumentResponse } from '~/common/decorators/api-document-response.decorator';
import { ApiFiles } from '~/common/decorators/api-files.decorator';
import { UUIDParam } from '~/common/decorators/param.decorator';
import { PaginatedResponseInterceptor } from '~/common/interceptors/paginated-response.interceptor';
import { UploadFileTypeValidator } from '~/common/validators/upload-file-type.validator';
import { AccessTokenGuard } from '~/modules/auth/guards/access-token.guard';
import { MAX_FILE_SIZE_IN_BYTES, MAX_FILES_TO_UPLOAD, VALID_ALL_MIME_TYPES } from '~/modules/files/constants/files.constant';
import { FilterFileDto } from './dto/filter-file.dto';
import { FilesService } from './files.service';
import { AwsS3Service } from '~/modules/aws/aws-s3.service';
import { Response as ExpressResponse } from 'express';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService, private readonly awsS3Service: AwsS3Service) {}

  @Post('upload')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Upload files' })
  @ApiFiles('files', true, MAX_FILES_TO_UPLOAD, {})
  async uploadFiles(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addValidator(new UploadFileTypeValidator({ fileType: VALID_ALL_MIME_TYPES }))
        .addMaxSizeValidator({ maxSize: MAX_FILE_SIZE_IN_BYTES })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    files: Express.Multer.File[],
    @Query('folder') folder?: string,
  ) {
    return await this.filesService.uploadFiles(files, folder);
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Get all files with pagination and filtering' })
  @UseInterceptors(PaginatedResponseInterceptor)
  find(@Query() filterDto: FilterFileDto) {
    return this.filesService.find(filterDto);
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Get a file by id' })
  findOne(@UUIDParam('id') id: string) {
    return this.filesService.findById(id);
  }

  @Get('public/:key')
  // Route này hoàn toàn public, không có guard
  async servePublicFile(@Param('key') key: string, @Res() res: ExpressResponse) {
    try {
      // Thêm header CORS cho file public
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      const stream = await this.awsS3Service.getObjectStream(key);
      stream.pipe(res);
    } catch (err) {
      res.status(404).send('File not found');
    }
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiParam({ name: 'id', example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' })
  async remove(@UUIDParam('id') id: string) {
    return await this.filesService.delete(id);
  }
}
