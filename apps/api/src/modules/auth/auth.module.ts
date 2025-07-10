import { Module } from '@nestjs/common';

import { RefreshTokenRepository } from '~/database/repositories/refresh-token.repository';
import { RepositoriesModule } from '~/database/repositories/repositories.module';
import { AuthBaseModule } from '~/shared-modules/auth-base/auth-base.module';
import { EmailModule } from '~/modules/email/email.module';
import { AdminAuthController } from './admin-auth.controller';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokensService } from './refresh-tokens.service';
import { TokenService } from './token.service';
import { VerificationService } from './verification.service';

@Module({
  imports: [RepositoriesModule, AuthBaseModule, EmailModule],
  controllers: [AdminAuthController, AuthController],
  providers: [AuthService, TokenService, RefreshTokensService, RefreshTokenRepository, VerificationService],
  exports: [AuthService, TokenService, RefreshTokensService, VerificationService],
})
export class AuthModule {}
