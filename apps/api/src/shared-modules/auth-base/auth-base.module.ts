import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { RepositoriesModule } from '~/database/repositories/repositories.module';
import { AuthBaseService } from './auth-base.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
    RepositoriesModule,
  ],
  providers: [AuthBaseService],
  exports: [AuthBaseService, JwtModule],
})
export class AuthBaseModule {}
