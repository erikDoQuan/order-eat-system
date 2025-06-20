import { Controller, Delete, Get, HttpStatus, ParseFilePipeBuilder, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { ApiDocumentResponse } from '~/common/decorators/api-document-response.decorator';
import { ApiFiles } from '~/common/decorators/api-files.decorator';
import { UUIDParam } from '~/common/decorators/param.decorator';
import { Response } from '~/common/decorators/response.decorator';
import { PaginatedResponseInterceptor } from '~/common/interceptors/paginated-response.interceptor';
import { UploadFileTypeValidator } from '~/common/validators/upload-file-type.validator';
import { AccessTokenGuard } from '~/modules/auth/guards/access-token.guard';
import { MAX_FILE_SIZE_IN_BYTES, MAX_FILES_TO_UPLOAD, VALID_ALL_MIME_TYPES } from '~/modules/files/constants/files.constant';
import { FilterFileDto } from './dto/filter-file.dto';
import { FilesService } from './files.service';

@ApiTags('Files')
@Controller('files')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth('accessToken')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload files' })
  @Response({ message: 'Files uploaded successfully' })
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
  @ApiOperation({ summary: 'Get all files with pagination and filtering' })
  @UseInterceptors(PaginatedResponseInterceptor)
  find(@Query() filterDto: FilterFileDto) {
    return this.filesService.find(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a file by id' })
  @Response({ message: 'Get file successfully' })
  findOne(@UUIDParam('id') id: string) {
    return this.filesService.findById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a file' })
  @Response({ message: 'File deleted successfully' })
  @ApiParam({ name: 'id', example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' })
  async remove(@UUIDParam('id') id: string) {
    return await this.filesService.delete(id);
  }
}
