import { FileValidator } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';

export type UploadTypeValidatorOptions = {
  fileType: string[];
};

export class UploadFileTypeValidator extends FileValidator {
  private allowedMimeTypes: string[];

  constructor(protected readonly validationOptions: UploadTypeValidatorOptions) {
    super(validationOptions);
    this.allowedMimeTypes = this.validationOptions.fileType;
  }

  public async isValid(file?: Express.Multer.File) {
    if (!file?.buffer) return false;

    const mimeType = await fileTypeFromBuffer(file.buffer);

    if (!mimeType) return false;

    return this.allowedMimeTypes.includes(mimeType.mime);
  }

  public buildErrorMessage(): string {
    return `Upload not allowed. Upload only files of type: ${this.allowedMimeTypes.join(', ')}`;
  }
}
