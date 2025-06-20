import { Injectable } from '@nestjs/common';
import { SignOptions } from 'jsonwebtoken';

import { createToken } from '~/common/utils/token.util';
import { AppConfigsService } from '~/config/config.service';
import { UserWithoutPassword } from '~/database/schema';

@Injectable()
export class TokenService {
  constructor(private readonly configService: AppConfigsService) {}

  createAccessToken(user: UserWithoutPassword): string {
    const { jwtSecretKey, jwtExpiresIn } = this.configService.get('auth');
    const accessToken = createToken({ id: user.id, email: user.email, role: user.role }, jwtSecretKey, {
      expiresIn: jwtExpiresIn as SignOptions['expiresIn'],
    });
    return accessToken;
  }

  createRefreshToken(user: UserWithoutPassword): string {
    const { jwtRefreshSecretKey, jwtRefreshExpiresIn } = this.configService.get('auth');
    const refreshToken = createToken({ id: user.id, email: user.email, role: user.role }, jwtRefreshSecretKey, {
      expiresIn: jwtRefreshExpiresIn as SignOptions['expiresIn'],
    });
    return refreshToken;
  }
}
