import { Module } from '@nestjs/common';

import { DrizzleModule } from '~/database/drizzle/drizzle.module';
import { FileRepository } from './files.repository';
import { RefreshTokenRepository } from './refresh-token.repository';
import { UserRepository } from './user.repository';

@Module({
  imports: [DrizzleModule],
  providers: [FileRepository, UserRepository, RefreshTokenRepository],
  exports: [FileRepository, UserRepository, RefreshTokenRepository],
})
export class RepositoriesModule {}
