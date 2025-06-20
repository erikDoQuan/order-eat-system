import { Controller, Get, HttpStatus, ParseFilePipeBuilder, Post, Req, UploadedFile, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { ApiDocumentResponse } from '~/common/decorators/api-document-response.decorator';
import { ApiFile } from '~/common/decorators/api-file.decorator';
import { Response } from '~/common/decorators/response.decorator';
import { UploadFileTypeValidator } from '~/common/validators/upload-file-type.validator';
import { User } from '~/database/schema';
import { MAX_AVATAR_FILE_SIZE_IN_BYTES, VALID_IMAGE_MIME_TYPES } from '~/modules/files/constants/files.constant';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { UsersService } from './users.service';

@Controller({ path: 'users' })
@ApiTags('Users')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth('accessToken')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get user profile' })
  @Response({ message: 'Get user profile successfully' })
  me(@Req() req: Request) {
    const user = req.user as User;

    return this.usersService.findOne(user.id);
  }

  @Post('change-avatar')
  @ApiOperation({ summary: 'Change user avatar' })
  @Response({ message: 'Change avatar successfully' })
  @ApiFile('avatar', true)
  uploadAvatar(
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addValidator(new UploadFileTypeValidator({ fileType: VALID_IMAGE_MIME_TYPES }))
        .addMaxSizeValidator({ maxSize: MAX_AVATAR_FILE_SIZE_IN_BYTES })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ) {
    const user = req.user as User;

    return this.usersService.updateAvatar(user.id, file);
  }
}
