import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import sharp from 'sharp';

import { PaginationResponseDto } from '~/common/dtos/pagination-response.dto';
import { toSlug } from '~/common/utils/string.util';
import { FileRepository } from '~/database/repositories/files.repository';
import { File } from '~/database/schema';
import { AwsS3Service } from '~/modules/aws/aws-s3.service';
import { FILE_STATUS, THUMBNAIL_SIZES, VALID_IMAGE_MIME_TYPES } from './constants/files.constant';
import { FilterFileDto } from './dto/filter-file.dto';
import { getFileExtension, getFileName } from './utils/file.util';

@Injectable()
export class FilesService {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async uploadFiles(files: Express.Multer.File[], folderPath?: string): Promise<File[]> {
    if (!files || files.length === 0) {
      return [];
    }

    const uploadedFileInfos: File[] = [];

    for (const file of files) {
      try {
        // Process file metadata
        const fileName = getFileName(file);
        const ext = await getFileExtension(file);
        const uniqueName = `${folderPath ? `${folderPath}/` : ''}${toSlug(fileName)}-${Date.now()}.${ext}`;

        // Create file record
        const fileData = {
          name: file.originalname,
          uniqueName,
          caption: fileName,
          ext,
          size: file.size,
          mime: file.mimetype,
          isTemp: false,
          status: FILE_STATUS.PUBLISHED,
          isActive: true,
        };

        // Save to database
        const fileInfo = await this.fileRepository.create(fileData);

        // Upload to S3
        await this.handleUploadFileS3(fileInfo, file);

        uploadedFileInfos.push(fileInfo);
      } catch (error) {
        throw new UnprocessableEntityException(`Failed to process file ${file.originalname}: ${(error as Error).message}`);
      }
    }

    return uploadedFileInfos;
  }

  async handleUploadFileS3(fileInfo: File, file: Express.Multer.File): Promise<void> {
    await this.awsS3Service.putObject({
      key: fileInfo.uniqueName,
      body: file.buffer,
    });

    if (VALID_IMAGE_MIME_TYPES.includes(fileInfo.mime)) {
      for (const [size, width] of Object.entries(THUMBNAIL_SIZES)) {
        const thumb = sharp(file.buffer).resize(width, null, {
          fit: 'contain',
        });

        await this.awsS3Service.putObject({
          key: `thumbnails/${size}/${fileInfo.uniqueName}`,
          body: await thumb.toBuffer(),
        });
      }
    }
  }

  async find(filterDto: FilterFileDto): Promise<PaginationResponseDto<File>> {
    return this.fileRepository.find(filterDto);
  }

  async findById(id: string): Promise<File> {
    const file = await this.fileRepository.findById(id);

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return file;
  }

  async delete(id: string): Promise<File | null> {
    const file = await this.findById(id);

    // First try to delete from S3
    try {
      await this.awsS3Service.removeObject(file.uniqueName);

      // Delete thumbnails if image
      if (VALID_IMAGE_MIME_TYPES.includes(file.mime)) {
        for (const size of Object.keys(THUMBNAIL_SIZES)) {
          await this.awsS3Service.removeObject(`thumbnails/${size}/${file.uniqueName}`);
        }
      }
    } catch (error) {
      console.error('Error deleting file from S3:', (error as Error).message);
    }

    // Then mark as deleted in database
    const deleted = await this.fileRepository.delete(id);

    if (!deleted) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return deleted;
  }
}
