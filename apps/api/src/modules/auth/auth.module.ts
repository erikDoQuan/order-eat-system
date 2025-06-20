import { Module } from '@nestjs/common';

import { RefreshTokenRepository } from '~/database/repositories/refresh-token.repository';
import { RepositoriesModule } from '~/database/repositories/repositories.module';
import { AuthBaseModule } from '~/shared-modules/auth-base/auth-base.module';
import { AdminAuthController } from './admin-auth.controller';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokensService } from './refresh-tokens.service';
import { TokenService } from './token.service';

@Module({
  imports: [RepositoriesModule, AuthBaseModule],
  controllers: [AdminAuthController, AuthController],
  providers: [AuthService, TokenService, RefreshTokensService, RefreshTokenRepository],
  exports: [AuthService, TokenService, RefreshTokensService],
})
export class AuthModule {}
