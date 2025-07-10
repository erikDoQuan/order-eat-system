import { Module } from '@nestjs/common';

import { DrizzleModule } from '~/database/drizzle/drizzle.module';
import { EmailVerificationRepository } from './email-verification.repository';
import { FileRepository } from './files.repository';
import { RefreshTokenRepository } from './refresh-token.repository';
import { UserRepository } from './user.repository';

@Module({
  imports: [DrizzleModule],
  providers: [FileRepository, UserRepository, RefreshTokenRepository, EmailVerificationRepository],
  exports: [FileRepository, UserRepository, RefreshTokenRepository, EmailVerificationRepository],
})
export class RepositoriesModule {}
