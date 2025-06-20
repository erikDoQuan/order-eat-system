import fs from 'fs';
import path from 'path';
import { UnprocessableEntityException, UnsupportedMediaTypeException } from '@nestjs/common';
import { Request } from 'express';
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';

import { toSlug } from '~/common/utils/string.util';
import { THUMBNAIL_PATH, THUMBNAIL_SIZES } from '../constants/files.constant';

export const getFileName = (file: Express.Multer.File): string => {
  const fileName = path.basename(file.originalname, path.extname(file.originalname));

  return toSlug(fileName);
};

export const getFileExtension = async (file: Express.Multer.File): Promise<string> => {
  const mimeType = await fileTypeFromBuffer(file.buffer);

  return mimeType?.ext || path.extname(file.originalname).slice(1);
};

export function mimetypeFilter(...mimetypes: string[]) {
  return (_req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    if (mimetypes.some(m => file.mimetype.includes(m))) {
      callback(null, true);
    } else {
      callback(new UnsupportedMediaTypeException(`File type is not matching: ${mimetypes.join(', ')}`), false);
    }
  };
}

export async function createThumbnail(filePath: string, fileName: string): Promise<void> {
  try {
    if (!fs.existsSync(THUMBNAIL_PATH)) {
      fs.mkdirSync(THUMBNAIL_PATH, { recursive: true });
    }

    const promises = Object.entries(THUMBNAIL_SIZES).map(([_size, width]) => {
      return sharp(filePath)
        .resize(width, null, {
          fit: 'contain',
        })
        .toFile(path.join(THUMBNAIL_PATH, fileName));
    });

    await Promise.all(promises);
  } catch (error) {
    throw new UnprocessableEntityException('Cannot create thumbnails');
  }
}

export function copyFile(sourceFilePath: string, destinationFilePath: string): void {
  try {
    fs.copyFileSync(sourceFilePath, destinationFilePath);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    throw new UnprocessableEntityException('Cannot copy file');
  }
}

export function removeDirectory(directoryPath: string): boolean {
  try {
    if (fs.existsSync(directoryPath)) {
      fs.rmSync(directoryPath, { recursive: true });

      return true;
    }

    return false;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    throw new UnprocessableEntityException('Cannot remove directory');
  }
}
