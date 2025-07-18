import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { IConfigs } from '~/common/interfaces/configs.interface';
import { User } from '~/database/schema';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { jwtRefreshSecretKey } = this.configService.get<IConfigs['auth']>('auth');
    const request: Request = context.switchToHttp().getRequest();

    const refreshToken = request.cookies['refreshToken'];

    if (!refreshToken) throw new BadRequestException('Token invalid');

    try {
      const payload = await this.jwtService.verifyAsync<User>(refreshToken, { secret: jwtRefreshSecretKey });

      request.user = payload;
    } catch {
      throw new BadRequestException('Token invalid');
    }

    return true;
  }
}
